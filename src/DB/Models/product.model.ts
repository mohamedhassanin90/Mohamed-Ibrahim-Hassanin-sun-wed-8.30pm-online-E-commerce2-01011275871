import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Mongoose, Types } from "mongoose";
import slugify from "slugify";
import { User } from "./user.model";
import { Category } from "./category.model";
import { Brand } from "./brand.model";

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Product {
  @Prop({
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
  })
  name: string;

  @Prop({
    type: String,
    minLength: 3,
    maxLength: 100,
  })
  slug: string;
  @Prop({
    type: String,
    minLength: 3,
    maxLength: 5000,
  })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  createdBy: Types.ObjectId;

  @Prop([
    {
      type: [String],
      required: true,
    },
  ])
  images: string[];

  @Prop({
    type: Number,
    required: true,
  })
  originalPrice: number;

  @Prop({
    type: Number,
    default: 0,
  })
  discountPercent: number;

  @Prop({
    type: Number,
    required: true,
  })
  salePrice: number;

  @Prop({
    type: Number,
    required: true,
  })
  stock: number;

    @Prop({
    type: Number,
    default:0,
  })
  soldItems: number;


  @Prop({
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Category.name,
    },
  })
  category: Types.ObjectId;
  @Prop({
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Brand.name,
    },
  })
  brand: Types.ObjectId;
}

export const productSchema = SchemaFactory.createForClass(Product);
export type HProductDocument = HydratedDocument<Product>;
productSchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
});

export const ProductModel = MongooseModule.forFeature([
  {
    name: Product.name,
    schema: productSchema,
  },
]);
