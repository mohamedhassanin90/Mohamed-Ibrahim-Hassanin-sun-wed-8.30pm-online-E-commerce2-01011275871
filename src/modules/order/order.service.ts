import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Cart } from "src/DB/Models/cart.model";
import { Order } from "src/DB/Models/order.model";
import { OrderStatusEnum, PaymentMethodEnum } from "src/common/enums/user.enum";
import { HUserDocument } from "src/DB/Models/user.model";
import { PaymentService } from "src/common/service/payment/payment.service";
import Stripe from "stripe";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly paymentService: PaymentService,
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
      subTotal: cart.subTotal,
      discount: cart.discount || 0,
      total: cart.totalAfterDiscount || cart.subTotal,
      address,
      phone,
      coupon: cart.coupon?._id,
      paymentMethod: PaymentMethodEnum.card,
      status: OrderStatusEnum.PROCCESSING,
    });
    cart.items = [];
    cart.save();

    return order;
  }

  async createCheckoutSession(orderId: Types.ObjectId, userId: Types.ObjectId) {
    const order = await this.orderModel
      .findOne({
        _id: orderId,
        user: userId,
        status: OrderStatusEnum.PROCCESSING,
        paymentMethod: PaymentMethodEnum.card,
      })
      .populate([{ path: "user" }, { path: "cart" }, { path: "coupon" }]);

    if (!order) throw new NotFoundException("order not found");

    const amount = order.total ?? order.subTotal ?? 0;
    const line_items = [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: `Order ${(order.user as unknown as HUserDocument).firstName}`,
            description: `Payment for order on address ${order.address}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ];

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
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

    const method = await this.paymentService.createPaymentMethod({
      type: "card",
      card: { token: "tok_visa" },
    });
    const intent = await this.paymentService.createPaymentIntent({
      amount: order.subTotal * 100,
      currency: "egp",
      payment_method: method.id,
      payment_method_types: [PaymentMethodEnum.card],
    });
    order.intentId = intent.id;
    await order.save();

    await this.paymentService.confirmPaymentIntent(intent.id);
    return session;
  }

  async refundOrder(orderId: Types.ObjectId, userId: Types.ObjectId) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      user: userId,
      paymentMethod: PaymentMethodEnum.card,
    });
    if (!order) throw new NotFoundException("Order Not Found");
    if (!order.intentId)
      throw new BadRequestException("No payment intent found for this order");
    const refund = await this.paymentService.createRefund(order.intentId);

    await this.orderModel.findByIdAndUpdate(orderId, {
      status: OrderStatusEnum.CANCELLED,
      refundId: refund.id,
      refundedAt: Date.now(),
      $unset: { intentId: true },
      $inc: { __v: 1 },
    }, {new:true});

    return order;
  }
}
