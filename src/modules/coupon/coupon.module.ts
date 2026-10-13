import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponModel } from 'src/DB/Models/coupon.model';
import { UserModel } from 'src/DB/Models/user.model';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports:[CouponModel,UserModel],
  controllers: [CouponController],
  providers: [CouponService, JwtService],
})
export class CouponModule {}
