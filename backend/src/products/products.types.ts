export type ProductImage = {
  id: string | null;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
};

export type ProductVariant = {
  id: string;
  name: string;
  code: string;
  price: number;
  overridePrice: number | null;
  stockQuantity: number;
  isActive: boolean;
};

export type ProductListItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type ProductsPaginationInput = {
  page: number;
  pageSize: number;
};

export type ProductsPaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ProductsListingResponse = {
  items: ProductListItem[];
  pagination: ProductsPaginationMeta;
};
