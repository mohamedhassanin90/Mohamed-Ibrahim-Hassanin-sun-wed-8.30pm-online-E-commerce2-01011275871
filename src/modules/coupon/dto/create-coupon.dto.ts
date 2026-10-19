import { Type } from "class-transformer";
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUppercase,
  Max,
  Min,
} from "class-validator";

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  code: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercent: number;

  @Type(() => Date)
  @IsDate()
  expiresAt: Date;
}
