import assert from "node:assert/strict";
import test from "node:test";

import { HttpError } from "../../http/errors.js";
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

test("ProductsService returns full details for a specific product", async () => {
  const service = new ProductsService({
    async listProducts() {
      return {
        items: [],
        totalItems: 0,
      };
    },
    async getProductById(productId) {
      return {
        id: productId,
        title: "Classic T-Shirt",
        description: "A shirt.",
        price: 20,
        imageUrl: null,
        images: [],
        variants: [],
      };
    },
  });

  const result = await service.getProductById(
    "123e4567-e89b-12d3-a456-426614174000",
  );

  assert.equal(result.id, "123e4567-e89b-12d3-a456-426614174000");
});

test("ProductsService throws a not found error when the product does not exist", async () => {
  const service = new ProductsService({
    async listProducts() {
      return {
        items: [],
        totalItems: 0,
      };
    },
    async getProductById() {
      return null;
    },
  });

  await assert.rejects(
    () => service.getProductById("123e4567-e89b-12d3-a456-426614174000"),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 404 &&
      error.message === "Product not found.",
  );
});
