import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Mongoose, Types } from "mongoose";
import { User } from "./user.model";
import { Cart } from "./cart.model";
import { Coupon } from "./coupon.model";
import { OrderStatusEnum, PaymentMethodEnum } from "src/common/enums/user.enum";

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Order {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  user: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Cart.name,
  })
  cart: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
  })
  subTotal: number;

  @Prop({
    type: Number,
    default: 0,
  })
  discount: number;

  @Prop({
    type: Number,
    default: 0,
  })
  total: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Coupon.name,
  })
  coupon?: Types.ObjectId;
  @Prop({
    type: String,
    enum: {
      values: Object.values(OrderStatusEnum),
      message: "{Value} is not supported",
    },
    default: OrderStatusEnum.PLACED,
  })
  status: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(PaymentMethodEnum),
      message: "{Value} is not supported",
    },
    default: PaymentMethodEnum.CASH,
  })
  paymentMethod: string;

  @Prop({
    type: String,
    required: true,
  })
  address: string;

  @Prop({
    type: String,
    required: true,
  })
  phone: string;

  @Prop({
    type: String,
  })
  intentId: string;

    @Prop({
    type: String,
  })
  refundId: string;

    @Prop({
    type: Date,
  })
  refundedAt: Date;
}

export const orderSchema = SchemaFactory.createForClass(Order);
export type HOrderDocument = HydratedDocument<Order>;

export const OrderModel = MongooseModule.forFeature([
  {
    name: Order.name,
    schema: orderSchema,
  },
]);
