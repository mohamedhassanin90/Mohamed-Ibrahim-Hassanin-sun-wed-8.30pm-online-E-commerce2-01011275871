import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Category } from "src/DB/Models/category.model";
import { Model, Types } from "mongoose";
import { Brand } from "src/DB/Models/brand.model";
import { HUserDocument } from "src/DB/Models/user.model";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    image: string,
    userId: HUserDocument["_id"],
  ) {
    const category = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });
    if (category) throw new ConflictException("category exists already");

    if (createCategoryDto.brands && createCategoryDto.brands.length > 0) {
      const invalidIds = createCategoryDto.brands.find(
        (id) => !Types.ObjectId.isValid(id),
      );
      if (invalidIds)
        throw new BadRequestException(
          `Invalid brand id format: ${invalidIds.toString()}`,
        );
      const foundBrands = await this.brandModel.find({
        _id: { $in: createCategoryDto.brands },
      });
      if (foundBrands.length !== createCategoryDto.brands.length)
        throw new BadRequestException("missing brand id");
    }

    const newCategory = await this.categoryModel.create({
      ...createCategoryDto,
      image,
      createdBy: userId,
    });
    return newCategory;
  }

  async findAll() {
    return await this.categoryModel.find();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid category id");
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException("Category Not Found");
    return category;
  }

  async update(id: string, body: UpdateCategoryDto) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid category id");
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException("Category Not Found");
    if (body.brands) {
      const invalidId = body.brands.find(
        (brandId) => !Types.ObjectId.isValid(brandId),
      );
      if (invalidId)
        throw new BadRequestException(
          `Invalid brand id format: ${invalidId.toString()}`,
        );
      const foundBrands = await this.brandModel.find({
        _id: { $in: body.brands },
      });
      if (foundBrands.length !== body.brands.length)
        throw new BadRequestException("missing brand id");
    }
    if (body.name) category.name = body.name;
    if (body.image) category.image = body.image;
    if (body.description) category.description = body.description;
    if (body.brands) category.brands = body.brands;
    await category.save();
    return category;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid category id");
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) throw new NotFoundException("Category Not Found");
    return { message: "Category deleted successfully", data: category };
  }
}
