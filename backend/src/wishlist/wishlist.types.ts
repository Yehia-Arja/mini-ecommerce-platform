export type WishlistProductSummary = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
};

export type WishlistItem = {
  id: string;
  createdAt: string;
  product: WishlistProductSummary;
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
