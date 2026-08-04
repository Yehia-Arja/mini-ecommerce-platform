export type OrderItem = {
  id: string;
  productId: string | null;
  productVariantId: string | null;
  productTitle: string;
  variantName: string;
  variantCode: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  cartId: string | null;
  status: "confirmed" | "cancelled";
  totalAmount: number;
  totalQuantity: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};
