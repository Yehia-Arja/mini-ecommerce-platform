import { HttpError } from "../http/errors.js";
import type {
  AddCartItemInput,
  Cart,
  CartVariantRecord,
  UpdateCartItemInput,
} from "./cart.types.js";
import type { CartRepositoryContract } from "./cart.repository.js";

export type CartServiceContract = {
  getCartByUserId(userId: string): Promise<Cart>;
  addItem(userId: string, input: AddCartItemInput): Promise<Cart>;
  updateItem(userId: string, cartItemId: string, input: UpdateCartItemInput): Promise<Cart>;
  removeItem(userId: string, cartItemId: string): Promise<void>;
};

export class CartService implements CartServiceContract {
  constructor(private readonly repository: CartRepositoryContract) {}

  async getCartByUserId(userId: string): Promise<Cart> {
    return this.repository.getCartByUserId(userId);
  }

  async addItem(userId: string, input: AddCartItemInput): Promise<Cart> {
    const variant = await this.requirePurchasableVariant(input.productVariantId);
    const existingItem = await this.repository.findCartItemByVariantId(
      userId,
      input.productVariantId,
    );
    const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;

    if (nextQuantity > variant.stockQuantity) {
      throw new HttpError(400, "Requested quantity exceeds available stock.");
    }

    return this.repository.addItem(userId, input);
  }

  async updateItem(
    userId: string,
    cartItemId: string,
    input: UpdateCartItemInput,
  ): Promise<Cart> {
    const existingItem = await this.repository.findCartItemById(userId, cartItemId);

    if (!existingItem) {
      throw new HttpError(404, "Cart item not found.");
    }

    const targetVariantId = input.productVariantId ?? existingItem.productVariantId;
    const conflictingItem =
      targetVariantId === existingItem.productVariantId
        ? null
        : await this.repository.findCartItemByVariantId(userId, targetVariantId);
    const targetQuantity =
      input.quantity ?? existingItem.quantity;
    const resultingQuantity =
      conflictingItem && conflictingItem.id !== existingItem.id
        ? conflictingItem.quantity + targetQuantity
        : targetQuantity;
    const variant = await this.requirePurchasableVariant(targetVariantId);

    if (resultingQuantity > variant.stockQuantity) {
      throw new HttpError(400, "Requested quantity exceeds available stock.");
    }

    const updateInput: UpdateCartItemInput = {};

    if (input.quantity != null) {
      updateInput.quantity = input.quantity;
    }

    if (input.productVariantId != null) {
      updateInput.productVariantId = input.productVariantId;
    }

    return this.repository.updateItem(userId, cartItemId, updateInput);
  }

  async removeItem(userId: string, cartItemId: string): Promise<void> {
    const removed = await this.repository.removeItem(userId, cartItemId);

    if (!removed) {
      throw new HttpError(404, "Cart item not found.");
    }
  }

  private async requirePurchasableVariant(
    productVariantId: string,
  ): Promise<CartVariantRecord> {
    const variant = await this.repository.findVariantById(productVariantId);

    if (!variant || !variant.isActive || variant.productStatus !== "active") {
      throw new HttpError(404, "Product variant not found.");
    }

    if (variant.stockQuantity <= 0) {
      throw new HttpError(400, "Selected variant is out of stock.");
    }

    return variant;
  }
}
