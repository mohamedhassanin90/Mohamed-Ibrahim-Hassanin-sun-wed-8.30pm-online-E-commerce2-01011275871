import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { AuthGuard } from "src/common/guard/auth.guard";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(AuthGuard)
  async addToCart(
    @Body() body: { productId: string; quantity: number },
    @Req() req,
  ) {
    const userId = req.user._id;
    return this.cartService.addToCart(userId, body.productId, body.quantity);
  }

  @UseGuards(AuthGuard)
  @Get()
  findOne(@Req() req) {
    const userId = req.user._id;
    return this.cartService.findOne(userId);
  }

  @UseGuards(AuthGuard)
  @Patch(":productId")
  updateCart(
    @Req() req,
    @Param("productId") productId: string,
    @Body("quantity") quantity: number,
  ) {
    const userId = req.user._id;
    return this.cartService.updateCart(userId, productId, quantity);
  }

  @UseGuards(AuthGuard)
  @Delete(":productId")
  remove(@Param("productId") productId: string, @Req() req) {
    const userId = req.user._id;
    return this.cartService.remove(userId, productId);
  }

   @UseGuards(AuthGuard)
  @Post("apply-coupon")
  applyCoupon(@Body("code") code: string, @Req() req) {
    const userId = req.user._id;
    return this.cartService.applyCoupon(userId, code);
  }
}
