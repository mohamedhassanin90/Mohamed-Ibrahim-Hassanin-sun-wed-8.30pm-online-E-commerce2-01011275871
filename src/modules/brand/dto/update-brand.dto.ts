import { IsString, Length, IsMongoId } from "class-validator";
import { Types } from "mongoose";

;

export class UpdateBrandDto {
      @IsString()
      @Length(3, 25)
      name: string;
    
      @IsString()
      image: string;
    
      @IsMongoId()
      createdBy: Types.ObjectId;
}
