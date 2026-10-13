import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  BadRequestException,
  ValidationPipe,
  UploadedFile,
} from "@nestjs/common";
import { BrandService } from "./brand.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "node:path";
import { Types } from "mongoose";

@Controller("brand")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./src/uploads/brands",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, //5mb
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
          return callback(
            new BadRequestException("Only images are allowed"),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  create(
    @Body("name", new ValidationPipe()) name: string,
    @Body("createdBy", new ValidationPipe()) createdBy: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const createBrandDto: CreateBrandDto = {
      name,
      createdBy,
      image: file.filename,
    };
    return this.brandService.create(createBrandDto);
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.brandService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./src/uploads/brands",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, //5mb
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
          return callback(
            new BadRequestException("Only images are allowed"),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  update(
    @Param("id") id: string,
    @Body() body: UpdateBrandDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) body.image = `uploads/brands/${file.filename}`;
    return this.brandService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.brandService.remove(id);
  }
}
