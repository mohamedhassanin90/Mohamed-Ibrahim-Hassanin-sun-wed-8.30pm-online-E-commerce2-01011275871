import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { CategoryModel } from "src/DB/Models/category.model";
import { BrandModel } from "src/DB/Models/brand.model";
import { UserModel } from "src/DB/Models/user.model";
import { CategoryResolver } from "./category.resolver";

@Module({
  imports: [CategoryModel, BrandModel, UserModel],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryResolver],
})
export class CategoryModule {}
