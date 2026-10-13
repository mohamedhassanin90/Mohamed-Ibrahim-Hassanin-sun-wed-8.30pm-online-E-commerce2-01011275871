import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { GenderEnum, ProviderEnum } from "src/common/enums/user.enum";
import { hash } from "src/common/utils/hashing/hash";
import { HOtpDocument } from "./otp.model";

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20,
    trim: true,
  })
  firstName: string;
  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20,
    trim: true,
  })
  lastName: string;
  @Virtual({
    get: function () {
      return this.firstName + " " + this.lastName;
    },
    set: function (value: string) {
      const [firstName, lastName] = value.split(" ") || [];
      this.set({ firstName, lastName });
    },
  })
  userName: string;
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;
  @Prop({
    type: Date,
  })
  confirmEmail: Date;
  @Prop({
    type: String,
  })
  confirmEmailOTP: string;
  @Prop({
    type: String,
    required: function () {
      return this.provider === "GOOGLE" ? false : true;
    },
  })
  password: string;
  @Prop({
    type: String,
    enum: {
      values: Object.values(GenderEnum),
      message: "{VALUE} is not valid gender",
    },
    default: GenderEnum.MALE,
  })
  gender: string;
  @Prop({
    type: String,
    enum: {
      values: Object.values(ProviderEnum),
      message: "{VALUE} is not valid provider",
    },
    default: ProviderEnum.SYSTEM,
  })
  provider: string;

  @Virtual()
  otp: HOtpDocument[];
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.virtual("otp", {
  localField: "_id",
  foreignField: "createdBy",
  ref: "Otp",
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hash(this.password);
  }
});

export type HUserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: userSchema,
  },
]);
