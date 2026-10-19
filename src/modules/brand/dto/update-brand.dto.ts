import { PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsString } from "class-validator";
import { CreateBrandDto } from "./create-brand.dto";

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @IsOptional()
  @IsString()
  image?: string;
}
