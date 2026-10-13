import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Cart } from "src/DB/Models/cart.model";
import { Model, Types } from "mongoose";
import { Product } from "src/DB/Models/product.model";
import { Coupon } from "src/DB/Models/coupon.model";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Coupon.name) private couponModel: Model<Coupon>,
  ) {}
  async addToCart(userId: Types.ObjectId, productId: string, quantity: number) {
    const product = await this.productModel.findById(
      new Types.ObjectId(productId),
    );
    if (!product) return new NotFoundException("Product Not Found");

    const price = product.salePrice;
    const total = price * quantity;

    let cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      cart = await this.cartModel.create({
        user: userId,
        items: [
          {
            product: productId,
            quantity,
            price,
            total,
          },
        ],
        subTotal: total,
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId,
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].total =
          cart.items[itemIndex].quantity * cart.items[itemIndex].price;
      } else {
        cart.items.push({
          product: new Types.ObjectId(productId),
          quantity,
          price,
          total,
        });
      }
      cart.subTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
      await cart.save();
    }
    return cart;
  }

  async findOne(userId: Types.ObjectId) {
    const cart = await this.cartModel.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name salePrice images slug -_id",
    });
    if (!cart) throw new NotFoundException("Cart Not Found");

    return cart;
  }

  async updateCart(
    userId: Types.ObjectId,
    productId: string,
    quantity: number,
  ) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException("Cart Not Found");

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (itemIndex === -1)
      throw new NotFoundException("Product Not Found In Cart");
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const item = cart.items[itemIndex];
      item.quantity = quantity;
      item.total = item.price * item.quantity;
    }
    cart.subTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    await cart.save();

    return cart;
  }

  async remove(userId: Types.ObjectId, productId: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException("Cart Not Found");

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (itemIndex === -1)
      throw new NotFoundException("Product Not Found In Cart");

    cart.items.splice(itemIndex, 1);
    cart.subTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    await cart.save();
    return { message: "cart is empty" };
  }

  async applyCoupon(userId: Types.ObjectId, code: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException("Cart Not Found");

    const coupon = await this.couponModel.findOne({ code });
    if (!coupon) throw new NotFoundException("code not found");

    const now = new Date();
    if (coupon.expiresAt < now)
      throw new BadRequestException("Coupon has expired");

    const discountedAmount = (cart.subTotal * coupon.discountPercent) / 100;
    const totalAfterDiscount = cart.subTotal - discountedAmount;

    cart.discount = coupon.discountPercent;
    cart.coupon = coupon._id;
    cart.totalAfterDiscount = totalAfterDiscount;

    await cart.save()

    return cart;
  }
}
