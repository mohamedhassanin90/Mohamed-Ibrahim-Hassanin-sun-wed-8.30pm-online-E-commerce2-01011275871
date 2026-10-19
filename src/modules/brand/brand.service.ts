import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Brand } from "src/DB/Models/brand.model";
import { Model, Types } from "mongoose";

@Injectable()
export class BrandService {
  constructor(@InjectModel(Brand.name) private brandModel: Model<Brand>) {}
  async create(
    createBrandDto: CreateBrandDto,
    image: string,
    userId: Types.ObjectId,
  ) {
    const brand = await this.brandModel.findOne({ name: createBrandDto.name });
    if (brand) throw new ConflictException("this brand already exists");
    const newBrand = await this.brandModel.create({
      ...createBrandDto,
      image,
      createdBy: userId,
    });
    return newBrand;
  }

  async findAll() {
    return await this.brandModel.find();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid brand id");
    const brand = await this.brandModel.findById(id);
    if (!brand) throw new NotFoundException("Brand Not Found");
    return brand;
  }

  async update(id: string, body: UpdateBrandDto) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid brand id");
    const brand = await this.brandModel.findById(id);
    if (!brand) throw new NotFoundException("Brand Not Found");

    if (body.name) brand.name = body.name;
    if (body.image) brand.image = body.image;

    await brand.save();
    return brand;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid brand id");
    const deleteBrand = await this.brandModel.findByIdAndDelete(id);
    if (!deleteBrand) throw new NotFoundException("brand doesn't exist");

    return { message: "Brand deleted successfully", data: deleteBrand };
  }
}
