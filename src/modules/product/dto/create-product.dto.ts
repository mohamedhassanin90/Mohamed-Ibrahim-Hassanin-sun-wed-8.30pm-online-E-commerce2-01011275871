import { Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsMongoId,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
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
  @Type(() => Number)
  originalPrice: number;

  @IsNumber()
  @Type(() => Number)
  salePrice: number;

  @IsNumber()
  @Type(() => Number)
  stock: number;

  @IsMongoId()
  category: Types.ObjectId;

  @IsMongoId()
  brand: Types.ObjectId;
}
