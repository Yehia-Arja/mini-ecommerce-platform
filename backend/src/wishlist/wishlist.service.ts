import { HttpError } from "../http/errors.js";
import type { Wishlist, AddWishlistItemInput } from "./wishlist.types.js";
import type { WishlistRepositoryContract } from "./wishlist.repository.js";

export type WishlistServiceContract = {
  getWishlistByUserId(userId: string): Promise<Wishlist>;
  addItem(userId: string, input: AddWishlistItemInput): Promise<Wishlist>;
  removeItem(userId: string, wishlistItemId: string): Promise<void>;
};

export class WishlistService implements WishlistServiceContract {
  constructor(private readonly repository: WishlistRepositoryContract) {}

  async getWishlistByUserId(userId: string): Promise<Wishlist> {
    return this.repository.getWishlistByUserId(userId);
  }

  async addItem(userId: string, input: AddWishlistItemInput): Promise<Wishlist> {
    const product = await this.repository.findProductById(input.productId);

    if (!product || product.status !== "active") {
      throw new HttpError(404, "Product not found.");
    }

    return this.repository.addItem(userId, input);
  }

  async removeItem(userId: string, wishlistItemId: string): Promise<void> {
    const removed = await this.repository.removeItem(userId, wishlistItemId);

    if (!removed) {
      throw new HttpError(404, "Wishlist item not found.");
    }
  }
}
