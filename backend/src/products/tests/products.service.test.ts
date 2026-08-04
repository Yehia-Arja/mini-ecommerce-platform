import assert from "node:assert/strict";
import test from "node:test";

import { ProductsService } from "../products.service.js";

test("ProductsService returns pagination metadata based on repository totals", async () => {
  const service = new ProductsService({
    async listProducts() {
      return {
        items: [
          {
            id: "product-1",
            title: "Classic T-Shirt",
            description: "A shirt.",
            price: 20,
            imageUrl: null,
            images: [],
            variants: [],
          },
        ],
        totalItems: 16,
      };
    },
  });

  const result = await service.listProducts({
    page: 2,
    pageSize: 15,
  });

  assert.deepEqual(result.pagination, {
    page: 2,
    pageSize: 15,
    totalItems: 16,
    totalPages: 2,
  });
});

test("ProductsService returns zero totalPages when the repository is empty", async () => {
  const service = new ProductsService({
    async listProducts() {
      return {
        items: [],
        totalItems: 0,
      };
    },
  });

  const result = await service.listProducts({
    page: 1,
    pageSize: 15,
  });

  assert.deepEqual(result.pagination, {
    page: 1,
    pageSize: 15,
    totalItems: 0,
    totalPages: 0,
  });
});
