import type { ProductListItem } from "../products/products.types.js";

export type WishlistItem = {
  id: string;
  createdAt: string;
  product: ProductListItem;
};

export type Wishlist = {
  userId: string;
  items: WishlistItem[];
  totalItems: number;
};

export type AddWishlistItemInput = {
  productId: string;
};

export type WishlistProductRecord = {
  id: string;
  status: string;
};
