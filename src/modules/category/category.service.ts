import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Category } from "src/DB/Models/category.model";
import { Model, Types } from "mongoose";
import { Brand } from "src/DB/Models/brand.model";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, image: string) {
    const category = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });
    if (category) throw new ConflictException("category exists already");

    if (createCategoryDto.brands && createCategoryDto.brands.length > 0) {
      const invalidIds = createCategoryDto.brands.find(
        (id) => !Types.ObjectId.isValid(id),
      );
      if (invalidIds)
        throw new BadRequestException(`Invalid brand id format :${invalidIds}`);
    }
    const foundBrands = await this.brandModel.find({
      _id: { $in: createCategoryDto.brands },
    });
    if (foundBrands.length !== createCategoryDto.brands?.length)
      throw new BadRequestException("missing brand id");

    const newCategory = await this.categoryModel.create({
      ...createCategoryDto,
      image,
    });
    return newCategory;
  }

  async findAll() {
    return await this.categoryModel.find();
  }

  async findOne(id: string) {
    return await this.categoryModel.findById(id);
  }

  async update(id: string, body: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new BadRequestException("category not found");
    if (body.name) category.name = body.name;
    if (body.image) category.image = body.image;
    if (body.description) category.description = body.description;
   if(body.brands) category.brands = body.brands;


    
     await category.save();
  return category;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
