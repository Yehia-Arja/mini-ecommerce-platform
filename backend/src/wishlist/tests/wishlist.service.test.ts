import assert from "node:assert/strict";
import test from "node:test";

import { HttpError } from "../../http/errors.js";
import { WishlistService } from "../wishlist.service.js";
import type { Wishlist } from "../wishlist.types.js";

const emptyWishlist: Wishlist = {
  userId: "user-1",
  items: [],
  totalItems: 0,
};

test("WishlistService returns the user's wishlist", async () => {
  const service = new WishlistService({
    async getWishlistByUserId() {
      return emptyWishlist;
    },
    async findProductById() {
      return { id: "product-1", status: "active" };
    },
    async addItem() {
      return emptyWishlist;
    },
    async removeItem() {
      return true;
    },
  });

  const result = await service.getWishlistByUserId("user-1");
  assert.equal(result.userId, "user-1");
});

test("WishlistService rejects adding an inactive or missing product", async () => {
  const service = new WishlistService({
    async getWishlistByUserId() {
      return emptyWishlist;
    },
    async findProductById() {
      return null;
    },
    async addItem() {
      return emptyWishlist;
    },
    async removeItem() {
      return true;
    },
  });

  await assert.rejects(
    () =>
      service.addItem("user-1", {
        productId: "product-1",
      }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 404 &&
      error.message === "Product not found.",
  );
});

test("WishlistService rejects removal of a missing wishlist item", async () => {
  const service = new WishlistService({
    async getWishlistByUserId() {
      return emptyWishlist;
    },
    async findProductById() {
      return { id: "product-1", status: "active" };
    },
    async addItem() {
      return emptyWishlist;
    },
    async removeItem() {
      return false;
    },
  });

  await assert.rejects(
    () => service.removeItem("user-1", "wishlist-item-1"),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 404 &&
      error.message === "Wishlist item not found.",
  );
});
