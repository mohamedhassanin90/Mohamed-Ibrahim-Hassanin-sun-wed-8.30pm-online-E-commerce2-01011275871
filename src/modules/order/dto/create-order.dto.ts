import { IsMongoId, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateOrderDto {
  @IsMongoId()
  cartId: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 500)
  address: string;

  @IsString()
  @IsNotEmpty()
  @Length(7, 20)
  phone: string;
}
