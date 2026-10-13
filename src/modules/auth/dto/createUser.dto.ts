import { GenderEnum, ProviderEnum } from "src/common/enums/user.enum";
import z from "zod";

export const createUserSchema = z
  .strictObject({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.email(),
    password: z.string(),
    confirmPassword: z.string(),
    gender: z.enum(GenderEnum).optional(),
    provider: z.enum(ProviderEnum).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirmPassword do not match",
    path: ["confirmPassword"],
  });
