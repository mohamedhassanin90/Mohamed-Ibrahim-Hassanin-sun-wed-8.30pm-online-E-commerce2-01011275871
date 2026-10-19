import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Coupon } from "src/DB/Models/coupon.model";

@Injectable()
export class CouponService {
  constructor(@InjectModel(Coupon.name) private couponModel: Model<Coupon>) {}
  async create(createCouponDto: CreateCouponDto, userId: Types.ObjectId) {
    const couponExists = await this.couponModel.findOne({
      code: createCouponDto.code,
    });
    if (couponExists) throw new ConflictException("coupon already exists");

    const coupon = await this.couponModel.create({
      ...createCouponDto,
      code: createCouponDto.code,
      createdBy: userId,
    });
    return coupon;
  }

  findAll() {
    return this.couponModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid coupon id");
    const coupon = await this.couponModel.findById(id);
    if (!coupon) throw new NotFoundException("Coupon Not Found");
    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid coupon id");

    if (updateCouponDto.code) {
      const duplicate = await this.couponModel.findOne({
        code: updateCouponDto.code,
        _id: { $ne: id },
      });
      if (duplicate) throw new ConflictException("coupon already exists");
    }

    const coupon = await this.couponModel.findById(id);
    if (!coupon) throw new NotFoundException("Coupon Not Found");

    Object.assign(coupon, updateCouponDto);
    return coupon.save();
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid coupon id");
    const coupon = await this.couponModel.findByIdAndDelete(id);
    if (!coupon) throw new NotFoundException("Coupon Not Found");
    return { message: "Coupon deleted successfully", data: coupon };
  }
}
