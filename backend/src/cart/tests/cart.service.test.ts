import assert from "node:assert/strict";
import test from "node:test";

import { HttpError } from "../../http/errors.js";
import { CartService } from "../cart.service.js";
import type { Cart, CartVariantRecord } from "../cart.types.js";

const emptyCart: Cart = {
  id: "cart-1",
  userId: "user-1",
  status: "active",
  items: [],
  totalQuantity: 0,
  total: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const variant: CartVariantRecord = {
  id: "variant-1",
  productId: "product-1",
  productTitle: "Classic T-Shirt",
  productImageUrl: null,
  variantName: "Large / Blue",
  variantCode: "TSHIRT-L-BLUE",
  unitPrice: 35,
  overridePrice: null,
  stockQuantity: 5,
  isActive: true,
  productStatus: "active",
};

test("CartService returns the user's cart", async () => {
  const service = new CartService({
    async getCartByUserId() {
      return emptyCart;
    },
    async findVariantById() {
      return variant;
    },
    async addItem() {
      return emptyCart;
    },
    async findCartItemById() {
      return null;
    },
    async findCartItemByVariantId() {
      return null;
    },
    async updateItem() {
      return emptyCart;
    },
    async removeItem() {
      return true;
    },
  });

  const result = await service.getCartByUserId("user-1");
  assert.equal(result.id, "cart-1");
});

test("CartService rejects add-to-cart requests that exceed stock after merging quantities", async () => {
  const service = new CartService({
    async getCartByUserId() {
      return emptyCart;
    },
    async findVariantById() {
      return variant;
    },
    async addItem() {
      return emptyCart;
    },
    async findCartItemById() {
      return null;
    },
    async findCartItemByVariantId() {
      return {
        id: "item-1",
        cartId: "cart-1",
        productVariantId: "variant-1",
        quantity: 4,
      };
    },
    async updateItem() {
      return emptyCart;
    },
    async removeItem() {
      return true;
    },
  });

  await assert.rejects(
    () =>
      service.addItem("user-1", {
        productVariantId: "variant-1",
        quantity: 2,
      }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message === "Requested quantity exceeds available stock.",
  );
});

test("CartService rejects updates for missing cart items", async () => {
  const service = new CartService({
    async getCartByUserId() {
      return emptyCart;
    },
    async findVariantById() {
      return variant;
    },
    async addItem() {
      return emptyCart;
    },
    async findCartItemById() {
      return null;
    },
    async findCartItemByVariantId() {
      return null;
    },
    async updateItem() {
      return emptyCart;
    },
    async removeItem() {
      return true;
    },
  });

  await assert.rejects(
    () => service.updateItem("user-1", "item-1", { quantity: 2 }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 404 &&
      error.message === "Cart item not found.",
  );
});

test("CartService rejects variant changes that would exceed stock after merging items", async () => {
  const service = new CartService({
    async getCartByUserId() {
      return emptyCart;
    },
    async findVariantById() {
      return variant;
    },
    async addItem() {
      return emptyCart;
    },
    async findCartItemById() {
      return {
        id: "item-1",
        cartId: "cart-1",
        productVariantId: "variant-old",
        quantity: 3,
      };
    },
    async findCartItemByVariantId(_userId, productVariantId) {
      if (productVariantId === "variant-1") {
        return {
          id: "item-2",
          cartId: "cart-1",
          productVariantId: "variant-1",
          quantity: 3,
        };
      }

      return null;
    },
    async updateItem() {
      return emptyCart;
    },
    async removeItem() {
      return true;
    },
  });

  await assert.rejects(
    () =>
      service.updateItem("user-1", "item-1", {
        productVariantId: "variant-1",
      }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message === "Requested quantity exceeds available stock.",
  );
});

test("CartService delegates a valid item removal", async () => {
  let removedItemId: string | null = null;

  const service = new CartService({
    async getCartByUserId() {
      return emptyCart;
    },
    async findVariantById() {
      return variant;
    },
    async addItem() {
      return emptyCart;
    },
    async findCartItemById() {
      return null;
    },
    async findCartItemByVariantId() {
      return null;
    },
    async updateItem() {
      return emptyCart;
    },
    async removeItem(_userId, cartItemId) {
      removedItemId = cartItemId;
      return true;
    },
  });

  await service.removeItem("user-1", "item-9");
  assert.equal(removedItemId, "item-9");
});
