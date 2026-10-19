import { Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsInt,
  Min,
  IsNumber,
} from "class-validator";
import { Types } from "mongoose";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  originalPrice: number;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  salePrice: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsMongoId()
  category: Types.ObjectId;

  @IsMongoId()
  brand: Types.ObjectId;
}
