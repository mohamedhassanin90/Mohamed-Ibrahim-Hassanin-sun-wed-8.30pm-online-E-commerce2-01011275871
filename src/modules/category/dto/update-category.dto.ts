import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsMongoId,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from "class-validator";
import { Types } from "mongoose";

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 25)
  name: string;

  @IsString()
  @IsOptional()
  @Length(3, 5000)
  description?: string;

 

  @IsString()
  image: string;
  
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsMongoId({ each: true })
  brands?: Types.ObjectId[];
}
