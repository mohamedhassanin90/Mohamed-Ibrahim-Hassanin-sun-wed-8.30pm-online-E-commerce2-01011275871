import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cart, HCartDocument } from "src/DB/Models/cart.model";
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
    this.validateItem(productId, quantity);
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException("Product Not Found");
    if (quantity > product.stock)
      throw new BadRequestException(
        "Requested quantity exceeds available stock",
      );

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
        if (cart.items[itemIndex].quantity + quantity > product.stock)
          throw new BadRequestException(
            "Requested quantity exceeds available stock",
          );
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
      this.clearDiscount(cart);
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
    this.validateProductId(productId);
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException("Cart Not Found");

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (itemIndex === -1)
      throw new NotFoundException("Product Not Found In Cart");
    if (!Number.isInteger(quantity) || quantity < 0)
      throw new BadRequestException("Quantity must be a non-negative integer");
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await this.productModel.findById(productId);
      if (!product) throw new NotFoundException("Product Not Found");
      if (quantity > product.stock)
        throw new BadRequestException(
          "Requested quantity exceeds available stock",
        );
      const item = cart.items[itemIndex];
      item.quantity = quantity;
      item.total = item.price * item.quantity;
    }
    cart.subTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    this.clearDiscount(cart);
    await cart.save();

    return cart;
  }

  async remove(userId: Types.ObjectId, productId: string) {
    this.validateProductId(productId);
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException("Cart Not Found");

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (itemIndex === -1)
      throw new NotFoundException("Product Not Found In Cart");

    cart.items.splice(itemIndex, 1);
    cart.subTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    this.clearDiscount(cart);
    await cart.save();
    return { message: "Product removed successfully", data: cart };
  }

  async applyCoupon(userId: Types.ObjectId, code: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException("Cart Not Found");
    if (!cart.items.length)
      throw new BadRequestException("Cannot apply a coupon to an empty cart");

    const coupon = await this.couponModel.findOne({ code });
    if (!coupon) throw new NotFoundException("code not found");

    const now = new Date();
    if (coupon.expiresAt <= now)
      throw new BadRequestException("Coupon has expired");

    const discountedAmount = (cart.subTotal * coupon.discountPercent) / 100;
    const totalAfterDiscount = cart.subTotal - discountedAmount;

    cart.discount = coupon.discountPercent;
    cart.coupon = coupon._id;
    cart.totalAfterDiscount = totalAfterDiscount;

    await cart.save();

    return cart;
  }

  private validateItem(productId: string, quantity: number) {
    this.validateProductId(productId);
    if (!Number.isInteger(quantity) || quantity <= 0)
      throw new BadRequestException("Quantity must be a positive integer");
  }

  private validateProductId(productId: string) {
    if (!Types.ObjectId.isValid(productId))
      throw new BadRequestException("Invalid product id");
  }

  private clearDiscount(cart: HCartDocument) {
    cart.discount = 0;
    cart.coupon = null;
    cart.totalAfterDiscount = cart.subTotal;
  }
}
