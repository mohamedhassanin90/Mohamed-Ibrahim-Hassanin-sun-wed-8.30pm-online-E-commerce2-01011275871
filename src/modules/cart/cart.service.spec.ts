import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { Cart } from "src/DB/Models/cart.model";
import { Coupon } from "src/DB/Models/coupon.model";
import { Product } from "src/DB/Models/product.model";
import { CartService } from "./cart.service";

describe("CartService", () => {
  const findCart = jest.fn();
  const findProduct = jest.fn();
  const cartModel = {
    findOne: findCart,
  } as unknown as Model<Cart>;
  const productModel = {
    findById: findProduct,
  } as unknown as Model<Product>;
  const couponModel = {} as Model<Coupon>;
  const service = new CartService(cartModel, productModel, couponModel);
  const userId = new Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects invalid product ids before querying MongoDB", async () => {
    await expect(
      service.addToCart(userId, "invalid-id", 1),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findProduct).not.toHaveBeenCalled();
  });

  it("throws when the requested product does not exist", async () => {
    findProduct.mockResolvedValue(null);

    await expect(
      service.addToCart(userId, new Types.ObjectId().toString(), 1),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects quantities above available inventory", async () => {
    findProduct.mockResolvedValue({ stock: 1 });

    await expect(
      service.addToCart(userId, new Types.ObjectId().toString(), 2),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("clears an applied coupon when cart quantities change", async () => {
    const productId = new Types.ObjectId();
    const cart = {
      items: [{ product: productId, quantity: 1, price: 10, total: 10 }],
      subTotal: 10,
      discount: 20,
      coupon: new Types.ObjectId(),
      totalAfterDiscount: 8,
      save: jest.fn(),
    };
    findCart.mockResolvedValue(cart as never);
    findProduct.mockResolvedValue({ stock: 10 });

    await service.updateCart(userId, productId.toString(), 2);

    expect(cart.subTotal).toBe(20);
    expect(cart.discount).toBe(0);
    expect(cart.coupon).toBeNull();
    expect(cart.totalAfterDiscount).toBe(20);
    expect(cart.save).toHaveBeenCalled();
  });
});
