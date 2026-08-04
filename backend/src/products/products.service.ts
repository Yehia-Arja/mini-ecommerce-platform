import { HttpError } from "../http/errors.js";
import type { ProductsRepositoryContract } from "./products.repository.js";
import type {
  ProductListItem,
  ProductsListingResponse,
  ProductsPaginationInput,
} from "./products.types.js";

export type ProductsServiceContract = {
  listProducts(input: ProductsPaginationInput): Promise<ProductsListingResponse>;
  getProductById(productId: string): Promise<ProductListItem>;
};

export class ProductsService implements ProductsServiceContract {
  constructor(private readonly repository: ProductsRepositoryContract) {}

  async listProducts(
    input: ProductsPaginationInput,
  ): Promise<ProductsListingResponse> {
    const { items, totalItems } = await this.repository.listProducts(input);
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / input.pageSize);

    return {
      items,
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  async getProductById(productId: string): Promise<ProductListItem> {
    const product = await this.repository.getProductById(productId);

    if (!product) {
      throw new HttpError(404, "Product not found.");
    }

    return product;
  }
}
