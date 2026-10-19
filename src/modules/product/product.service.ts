import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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
    if (createProductDto.salePrice > createProductDto.originalPrice)
      throw new BadRequestException(
        "Sale price cannot exceed the original price",
      );

    const brandExists = await this.brandModel.findById(createProductDto.brand);

    if (!brandExists) throw new NotFoundException("Brand Not Found");

    const categoryExist = await this.categoryModel.findById(
      createProductDto.category,
    );

    if (!categoryExist) throw new NotFoundException("Category Not Found");

    const images =
      files?.map((file) => `./src/uploads/products/${file.filename}`) ?? [];
    return this.productModel.create({
      ...createProductDto,
      images,
      createdBy: userId,
    });
  }

  findAll() {
    return this.productModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid product id");

    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException("Product Not Found");
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid product id");

    if (updateProductDto.brand) {
      const brandExists = await this.brandModel.findById(
        updateProductDto.brand,
      );
      if (!brandExists) throw new NotFoundException("Brand Not Found");
    }

    if (updateProductDto.category) {
      const categoryExists = await this.categoryModel.findById(
        updateProductDto.category,
      );
      if (!categoryExists) throw new NotFoundException("Category Not Found");
    }

    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException("Product Not Found");

    Object.assign(product, updateProductDto);
    return product.save();
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid product id");

    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) throw new NotFoundException("Product Not Found");
    return { message: "Product deleted successfully", data: product };
  }
}
