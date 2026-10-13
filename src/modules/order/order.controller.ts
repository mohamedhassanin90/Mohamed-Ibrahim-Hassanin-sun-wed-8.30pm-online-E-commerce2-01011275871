import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { AuthGuard } from "src/common/guard/auth.guard";
import { Types } from "mongoose";
import type { HUserDocument } from "src/DB/Models/user.model";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() body: { cartId: string; address: string; phone: string },
    @Req() req,
  ) {
    const userId = req.user._id;
    const { cartId, address, phone } = body;
    return this.orderService.create(userId, address, cartId, phone);
  }

  @UseGuards(AuthGuard)
  @Post("checkout/:orderId")
  async createCheckoutSession(
    @Param("orderId") orderId: Types.ObjectId,
    @Req() req,
  
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
    @Param("orderId") orderId: Types.ObjectId,
    @Req() req,

  ) {
    const userId = req.user._id;
    const refund = await this.orderService.refundOrder(
      orderId,
      userId,
    );
    return refund;
  }
}
