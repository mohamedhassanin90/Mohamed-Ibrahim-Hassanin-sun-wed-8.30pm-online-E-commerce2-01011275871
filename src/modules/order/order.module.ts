import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { UserModel } from 'src/DB/Models/user.model';
import { CartModel } from 'src/DB/Models/cart.model';
import { OrderModel } from 'src/DB/Models/order.model';
import { CouponModel } from 'src/DB/Models/coupon.model';
import { JwtService } from '@nestjs/jwt';
import { PaymentService } from 'src/common/service/payment/payment.service';

@Module({
  imports:[UserModel,CartModel,OrderModel,CouponModel],
  controllers: [OrderController],
  providers: [OrderService , JwtService , PaymentService],
})
export class OrderModule {}
