import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { AuthGuard } from "src/common/guard/auth.guard";

@Controller("coupon")
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body(new ValidationPipe()) createCouponDto: CreateCouponDto,
    @Req() req,
  ) {
    const userId = req.user._id
    return this.couponService.create(createCouponDto ,userId);
  }

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.couponService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(+id, updateCouponDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.couponService.remove(+id);
  }
}
