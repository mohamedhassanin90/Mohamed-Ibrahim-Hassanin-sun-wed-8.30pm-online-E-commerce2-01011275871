import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { OtpEnum } from "src/common/enums/user.enum";
import { emailEvents } from "src/common/utils/events/email.events";
import { hash } from "src/common/utils/hashing/hash";
import { User } from "./user.model";

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Otp {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  code: string;
  @Prop({
    type: Date,
    required: true,
  })
  expiredAt: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  createdBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: OtpEnum,
    required: true,
  })
  type: string;
}

export const otpSchema = SchemaFactory.createForClass(Otp);
export type HOtpDocument = HydratedDocument<Otp>;

otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.pre(
  "save",
  async function (this: HOtpDocument & { wasNew: boolean; plainotp?: string }) {
    if (this.isModified("code")) {
      this.wasNew = this.isNew;
      this.plainotp = this.code;
      this.code = await hash(this.code);
      await this.populate("createdBy");
    }
  },
);
otpSchema.post("save", async function () {
  const that = this as HOtpDocument & { wasNew?: boolean; plainotp?: string };

  if (that.wasNew && that.plainotp) {
    const populated = await that.populate<{ createdBy: User }>("createdBy");
    emailEvents.emit("confirm-email", {
      to: populated.createdBy.email,
      otp: that.plainotp,
      firstName: populated.createdBy.firstName,
    });
  }
});

export const OtpModel = MongooseModule.forFeature([
  {
    name: Otp.name,
    schema: otpSchema,
  },
]);
