import { GenderEnum, ProviderEnum } from "src/common/enums/user.enum";
import z from "zod";

export const createUserSchema = z
  .strictObject({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    gender: z.enum(GenderEnum).optional(),
    provider: z.enum(ProviderEnum).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirmPassword do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(8),
});

export const resendOtpSchema = z.strictObject({ email: z.email() });
export const confirmEmailSchema = z.strictObject({
  email: z.email(),
  otp: z.string().min(4).max(10),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type ConfirmEmailInput = z.infer<typeof confirmEmailSchema>;
