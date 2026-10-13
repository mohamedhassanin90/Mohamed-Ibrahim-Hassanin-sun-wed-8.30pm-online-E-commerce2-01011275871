import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModel } from "src/DB/Models/user.model";
import { OtpModel } from "src/DB/Models/otp.model";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [UserModel, OtpModel],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {
  constructor() {}
}
