import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { CartModel } from "src/DB/Models/cart.model";
import { UserModel } from "src/DB/Models/user.model";
import { ProductModel } from "src/DB/Models/product.model";
import { JwtService } from "@nestjs/jwt";
import { CouponModel } from "src/DB/Models/coupon.model";

@Module({
  imports: [CartModel, UserModel, ProductModel , CouponModel],
  controllers: [CartController],
  providers: [CartService, JwtService],
})
export class CartModule {}
