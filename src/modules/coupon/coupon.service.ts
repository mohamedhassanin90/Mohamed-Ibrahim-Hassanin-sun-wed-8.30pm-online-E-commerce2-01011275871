import { ConflictException, Injectable } from "@nestjs/common";
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
    return `This action returns all coupon`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coupon`;
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    return `This action updates a #${id} coupon`;
  }

  remove(id: number) {
    return `This action removes a #${id} coupon`;
  }
}
