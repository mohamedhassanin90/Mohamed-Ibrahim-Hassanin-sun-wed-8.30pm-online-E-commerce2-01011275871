import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { CategoryModel } from "src/DB/Models/category.model";
import { BrandModel } from "src/DB/Models/brand.model";

@Module({
  imports: [CategoryModel, BrandModel],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
