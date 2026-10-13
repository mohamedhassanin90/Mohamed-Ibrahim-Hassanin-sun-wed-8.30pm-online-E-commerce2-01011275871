import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "src/DB/Models/product.model";
import { Category } from "src/DB/Models/category.model";
import { Brand } from "src/DB/Models/brand.model";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    userId: Types.ObjectId,
    files: Express.Multer.File[],
  ) {
    const brandExists = await this.brandModel.findById(createProductDto.brand);

    if (!brandExists) return new NotFoundException("Brand Not Found");

    const categoryExist = await this.categoryModel.findById(
      createProductDto.category,
    );

    if (!categoryExist) return new NotFoundException("Category Not Found");

    const images: string[] = [];
    if (files?.length) {
      for (const file of files) {
        images.push(`./src/uploads/products/${file.filename}`);
      }
    }
    const product = await this.productModel.create({
      ...createProductDto,
      images,
      createdBy: userId,
    });
    return product;
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
