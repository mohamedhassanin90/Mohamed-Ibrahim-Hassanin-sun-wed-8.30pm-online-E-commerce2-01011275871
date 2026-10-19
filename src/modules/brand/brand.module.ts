import { Module } from "@nestjs/common";
import { BrandService } from "./brand.service";
import { BrandController } from "./brand.controller";
import { BrandModel } from "src/DB/Models/brand.model";
import { BrandResolver } from "./brand.resolver";

@Module({
  imports: [BrandModel],
  controllers: [BrandController],
  providers: [BrandService, BrandResolver],
})
export class BrandModule {}
