import { EventEmitter } from "node:events";
import { template } from "../email/verify.email.template";
import { sendEmail } from "../email/send.email";
import { OtpEnum } from "src/common/enums/user.enum";

export const emailEvents = new EventEmitter();

emailEvents.on("confirm-email", async (data) => {
  try {
    data.Subject = OtpEnum.EMAIL_VERIFICATION,
    data.html = template(data.otp, data.firstName, data.Subject);
    await sendEmail(data);
  } catch (error) {
    console.log("fail to send email", error);
  }
});
