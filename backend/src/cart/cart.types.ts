export type CartProductSummary = {
  id: string;
  title: string;
  imageUrl: string | null;
};

export type CartVariantSummary = {
  id: string;
  name: string;
  code: string;
  price: number;
  overridePrice: number | null;
  stockQuantity: number;
};

export type CartItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: CartProductSummary;
  variant: CartVariantSummary;
};

export type Cart = {
  id: string;
  userId: string;
  status: "active" | "converted" | "abandoned";
  items: CartItem[];
  totalQuantity: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type AddCartItemInput = {
  productVariantId: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  quantity?: number;
  productVariantId?: string;
};

export type CartVariantRecord = {
  id: string;
  productId: string;
  productTitle: string;
  productImageUrl: string | null;
  variantName: string;
  variantCode: string;
  unitPrice: number;
  overridePrice: number | null;
  stockQuantity: number;
  isActive: boolean;
  productStatus: string;
};
