import { IsString, Length } from "class-validator";

export class CreateBrandDto {
  @IsString()
  @Length(3, 25)
  name: string;
}
