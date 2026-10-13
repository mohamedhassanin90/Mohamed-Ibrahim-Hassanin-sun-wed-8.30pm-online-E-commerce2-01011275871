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
  collection:'categories',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
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

  @Prop({
    type: String,
    required: true,
  })
  image: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
  })
  brands: Types.ObjectId[];
}

export const categorySchema = SchemaFactory.createForClass(Category);
export type HCategoryDocument = HydratedDocument<Category>;
categorySchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
});

export const CategoryModel = MongooseModule.forFeature([
  {
    name: Category.name,
    schema: categorySchema,
  },
]);
