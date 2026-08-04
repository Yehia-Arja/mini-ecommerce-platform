import type { ProductsRepositoryContract } from "./products.repository.js";
import type {
  ProductsListingResponse,
  ProductsPaginationInput,
} from "./products.types.js";

export type ProductsServiceContract = {
  listProducts(input: ProductsPaginationInput): Promise<ProductsListingResponse>;
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
}
