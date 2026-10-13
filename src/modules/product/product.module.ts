import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { BrandModel } from "src/DB/Models/brand.model";
import { ProductModel } from "src/DB/Models/product.model";
import { CategoryModel } from "src/DB/Models/category.model";
import { UserModel } from "src/DB/Models/user.model";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [BrandModel, ProductModel, CategoryModel, UserModel],
  controllers: [ProductController],
  providers: [ProductService , JwtService],
})
export class ProductModule {}
