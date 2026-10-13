import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
} from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { User } from "./user.model";
import { Product } from "./product.model";
import { Coupon } from "./coupon.model";

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Cart {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: User.name,
  })
  user: Types.ObjectId;

  @Prop([
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Product.name,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ])
  items: {
    product: Types.ObjectId;
    quantity: number;
    price: number;
    total: number;
  }[];

  @Prop({
    type: Number,
    required: true,
  })
  subTotal: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Coupon.name,
  })
  coupon?: Types.ObjectId | null;

  @Prop({
    type: Number,
    default: 0,
  })
  discount?: number | null;

  @Prop({
    type: Number,
    default: 0,
  })
  totalAfterDiscount?: number;
}

export const cartSchema = SchemaFactory.createForClass(Cart);
export type HCartDocument = HydratedDocument<Cart>;

export const CartModel = MongooseModule.forFeature([
  {
    name: Cart.name,
    schema: cartSchema,
  },
]);
