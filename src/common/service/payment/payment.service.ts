import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async checkoutSession({
    success_url = process.env.SUCCESS_URL as string,
    cancel_url = process.env.CANCEL_URL as string,
    mode = "payment",
    discounts = [],
    metadata = {},
    line_items,
    customer_email,
  }: Stripe.Checkout.SessionCreateParams) {
    const session = await this.stripe.checkout.sessions.create({
      customer_email,
      success_url,
      line_items,
      mode,
      cancel_url,
      discounts,
      metadata,
    });
    return session;
  }

  async createCoupon(data: Stripe.CouponCreateParams) {
    const coupon = await this.stripe.coupons.create(data);
    return coupon;
  }

  async createPaymentMethod(data: Stripe.PaymentMethodCreateParams) {
    const method = await this.stripe.paymentMethods.create(data);
    return method;
  }

  async createPaymentIntent(data: Stripe.PaymentIntentCreateParams) {
    const intent = await this.stripe.paymentIntents.create(data);
    return intent;
  }
  async retrievePaymentIntent(id: string) {
    const intent = await this.stripe.paymentIntents.retrieve(id);
    return intent;
  }

  async retrieveCheckoutSession(id: string) {
    return this.stripe.checkout.sessions.retrieve(id);
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new InternalServerErrorException(
        "Stripe webhook secret is not configured",
      );
    }
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  async confirmPaymentIntent(id: string) {
    const intent = await this.retrievePaymentIntent(id);
    if (!intent) throw new BadRequestException("invalid payment intent id");
    const confirmIntent = await this.stripe.paymentIntents.confirm(id);
    return confirmIntent;
  }

  async createRefund(id: string, idempotencyKey: string) {
    const intent = await this.retrievePaymentIntent(id);
    if (!intent) throw new BadRequestException("invalid payment intent id");
    const refund = await this.stripe.refunds.create(
      { payment_intent: id },
      { idempotencyKey },
    );
    return refund;
  }
}
