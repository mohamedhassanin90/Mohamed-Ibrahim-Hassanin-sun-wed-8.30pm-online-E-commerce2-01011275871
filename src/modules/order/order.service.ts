import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Cart } from "src/DB/Models/cart.model";
import { Order } from "src/DB/Models/order.model";
import { OrderStatusEnum, PaymentMethodEnum } from "src/common/enums/user.enum";
import { HUserDocument } from "src/DB/Models/user.model";
import { PaymentService } from "src/common/service/payment/payment.service";
import { OrderGateway } from "./order.gateway";
import type Stripe from "stripe";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly paymentService: PaymentService,
    private readonly orderGateway: OrderGateway,
  ) {}
  async create(
    userId: Types.ObjectId,
    address: string,
    cartId: string,
    phone: string,
  ) {
    const cart = await this.cartModel
      .findOne({ _id: cartId, user: userId })
      .populate("coupon");
    if (!cart) throw new NotFoundException("Cart not found");

    if (!cart.items.length) throw new BadRequestException("Cart is empty");

    const order = await this.orderModel.create({
      user: userId,
      cart: cart._id,
      items: cart.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      subTotal: cart.subTotal,
      discount: cart.discount || 0,
      total: cart.totalAfterDiscount || cart.subTotal,
      address,
      phone,
      coupon: cart.coupon?._id,
      paymentMethod: PaymentMethodEnum.card,
      status: OrderStatusEnum.PLACED,
    });
    cart.items = [];
    await cart.save();

    this.orderGateway.emitOrderCreated(userId.toString(), {
      id: order._id.toString(),
      status: order.status,
      total: order.total,
    });

    return order;
  }

  async createCheckoutSession(orderId: string, userId: Types.ObjectId) {
    if (!Types.ObjectId.isValid(orderId))
      throw new BadRequestException("Invalid order id");
    const order = await this.orderModel
      .findOne({
        _id: orderId,
        user: userId,
        status: OrderStatusEnum.PLACED,
        paymentMethod: PaymentMethodEnum.card,
      })
      .populate([{ path: "user" }, { path: "cart" }, { path: "coupon" }]);

    if (!order) throw new NotFoundException("order not found");

    if (order.checkoutSessionId) {
      const existingSession = await this.paymentService.retrieveCheckoutSession(
        order.checkoutSessionId,
      );
      if (existingSession.status !== "expired") return existingSession;
    }

    const amount = order.subTotal;
    const line_items = [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: `Order ${(order.user as unknown as HUserDocument).firstName}`,
            description: `Payment for order on address ${order.address}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ];

    const discounts: { coupon: string }[] = [];
    if (order.discount) {
      const coupon = await this.paymentService.createCoupon({
        duration: "once",
        currency: "egp",
        percent_off: order.discount,
      });
      discounts.push({ coupon: coupon.id });
    }

    const session = await this.paymentService.checkoutSession({
      customer_email: (order.user as unknown as HUserDocument).email,
      line_items: line_items,
      mode: "payment",
      discounts,
      metadata: { orderId: orderId.toString() },
    });
    order.checkoutSessionId = session.id;
    await order.save();
    return session;
  }

  async completeCheckoutSession(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    const intentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!orderId || !Types.ObjectId.isValid(orderId) || !intentId)
      throw new BadRequestException("Checkout session is missing payment data");

    const order = await this.orderModel.findOneAndUpdate(
      {
        _id: orderId,
        checkoutSessionId: session.id,
        paymentMethod: PaymentMethodEnum.card,
        status: OrderStatusEnum.PLACED,
      },
      {
        $set: {
          intentId,
          status: OrderStatusEnum.PROCCESSING,
        },
      },
      { new: true },
    );

    if (!order) {
      const existingOrder = await this.orderModel.findOne({
        _id: orderId,
        checkoutSessionId: session.id,
        intentId,
      });
      if (existingOrder) return existingOrder;
      throw new NotFoundException("Unpaid order not found");
    }

    this.orderGateway.emitOrderUpdated(order.user.toString(), {
      id: order._id.toString(),
      status: order.status,
      total: order.total,
    });
    return order;
  }

  async refundOrder(orderId: Types.ObjectId | string, userId: Types.ObjectId) {
    if (!Types.ObjectId.isValid(orderId))
      throw new BadRequestException("Invalid order id");
    const order = await this.orderModel.findOne({
      _id: orderId,
      user: userId,
      paymentMethod: PaymentMethodEnum.card,
      status: {
        $in: [
          OrderStatusEnum.PROCCESSING,
          OrderStatusEnum.SHIPPED,
          OrderStatusEnum.DELIVERED,
        ],
      },
    });
    if (!order) throw new NotFoundException("Order Not Found");
    if (!order.intentId)
      throw new BadRequestException("No payment intent found for this order");
    const refund = await this.paymentService.createRefund(
      order.intentId,
      `order-refund-${order._id.toString()}`,
    );

    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        status: OrderStatusEnum.CANCELLED,
        refundId: refund.id,
        refundedAt: Date.now(),
        $inc: { __v: 1 },
      },
      { new: true },
    );
    if (!updatedOrder) throw new NotFoundException("Order Not Found");

    this.orderGateway.emitOrderUpdated(userId.toString(), {
      id: updatedOrder._id.toString(),
      status: updatedOrder.status,
      total: updatedOrder.total,
    });

    return updatedOrder;
  }
}
