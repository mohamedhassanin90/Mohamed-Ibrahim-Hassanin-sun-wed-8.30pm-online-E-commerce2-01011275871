import { Model, Types } from "mongoose";
import { Order } from "src/DB/Models/order.model";
import { Cart } from "src/DB/Models/cart.model";
import { PaymentService } from "src/common/service/payment/payment.service";
import { OrderGateway } from "./order.gateway";
import { OrderService } from "./order.service";
import type Stripe from "stripe";

describe("OrderService payment completion", () => {
  const findOneAndUpdate = jest.fn();
  const findOne = jest.fn();
  const emitOrderUpdated = jest.fn();
  const orderModel = {
    findOneAndUpdate,
    findOne,
  } as unknown as Model<Order>;
  const cartModel = {} as Model<Cart>;
  const paymentService = {} as PaymentService;
  const gateway = { emitOrderUpdated } as unknown as OrderGateway;
  const service = new OrderService(
    cartModel,
    orderModel,
    paymentService,
    gateway,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("records a paid checkout and emits the updated order", async () => {
    const orderId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    const order = {
      _id: orderId,
      user: userId,
      status: "PROCCESSING",
      total: 25,
    };
    findOneAndUpdate.mockResolvedValue(order);

    await service.completeCheckoutSession({
      id: "cs_paid",
      metadata: { orderId: orderId.toString() },
      payment_intent: "pi_paid",
    } as Stripe.Checkout.Session);

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: orderId.toString(),
        checkoutSessionId: "cs_paid",
        status: "PLACED",
      }),
      {
        $set: {
          intentId: "pi_paid",
          status: "PROCCESSING",
        },
      },
      { new: true },
    );
    expect(emitOrderUpdated).toHaveBeenCalledWith(userId.toString(), {
      id: orderId.toString(),
      status: "PROCCESSING",
      total: 25,
    });
  });

  it("handles duplicate Stripe webhook delivery without emitting twice", async () => {
    const orderId = new Types.ObjectId();
    const existingOrder = { _id: orderId, intentId: "pi_paid" };
    findOneAndUpdate.mockResolvedValue(null);
    findOne.mockResolvedValue(existingOrder);

    await expect(
      service.completeCheckoutSession({
        id: "cs_paid",
        metadata: { orderId: orderId.toString() },
        payment_intent: "pi_paid",
      } as Stripe.Checkout.Session),
    ).resolves.toBe(existingOrder);
    expect(emitOrderUpdated).not.toHaveBeenCalled();
  });
});
