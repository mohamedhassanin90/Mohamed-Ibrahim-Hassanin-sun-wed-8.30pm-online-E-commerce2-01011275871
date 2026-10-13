import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandModel } from 'src/DB/Models/brand.model';

@Module({
  imports:[BrandModel],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
