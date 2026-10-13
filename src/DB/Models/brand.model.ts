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

@Schema({
  collection: 'brand',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Brand {
  @Prop({
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 25,
  })
  name: string;
  @Prop({
    type: String,
    minLength: 3,
    maxLength: 25,
  })
  slug: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  createdBy: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  image: string;
}

export const brandSchema = SchemaFactory.createForClass(Brand);
export type HBrandDocument = HydratedDocument<Brand>;
brandSchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
});

export const BrandModel = MongooseModule.forFeature([
  {
    name: Brand.name,
    schema: brandSchema,
  },
]);
