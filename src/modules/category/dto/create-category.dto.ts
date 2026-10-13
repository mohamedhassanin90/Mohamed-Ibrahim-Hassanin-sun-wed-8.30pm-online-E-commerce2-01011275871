import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { Types } from "mongoose";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 25)
  name: string;

  @IsString()
  @IsOptional()
  @Length(3, 5000)
  description?: string;

  @IsMongoId()
  @IsNotEmpty()
  createdBy: Types.ObjectId;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsMongoId({ each: true })
  brands?: Types.ObjectId[];
}
