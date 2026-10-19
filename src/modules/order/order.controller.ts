import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { AuthGuard } from "src/common/guard/auth.guard";
import type { AuthenticatedRequest } from "src/common/guard/auth.guard";
import { PaymentService } from "src/common/service/payment/payment.service";

@Controller("order")
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post("stripe/webhook")
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature?: string,
  ) {
    if (!request.rawBody || !signature)
      throw new BadRequestException("Stripe webhook signature is required");

    const event = this.paymentService.constructWebhookEvent(
      request.rawBody,
      signature,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid")
        await this.orderService.completeCheckoutSession(session);
    }

    return { received: true };
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() body: CreateOrderDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user._id;
    const { cartId, address, phone } = body;
    return this.orderService.create(userId, address, cartId, phone);
  }

  @UseGuards(AuthGuard)
  @Post("checkout/:orderId")
  async createCheckoutSession(
    @Param("orderId") orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user._id;
    const session = await this.orderService.createCheckoutSession(
      orderId,
      userId,
    );
    return session;
  }

  @UseGuards(AuthGuard)
  @Post("refund/:orderId")
  async refundOrder(
    @Param("orderId") orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user._id;
    const refund = await this.orderService.refundOrder(orderId, userId);
    return refund;
  }
}
