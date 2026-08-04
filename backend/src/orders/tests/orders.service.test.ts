import assert from "node:assert/strict";
import test from "node:test";

import { HttpError } from "../../http/errors.js";
import { OrdersService } from "../orders.service.js";
import type { Order } from "../orders.types.js";

const order: Order = {
  id: "order-1",
  userId: "user-1",
  cartId: "cart-1",
  status: "confirmed",
  totalAmount: 40,
  totalQuantity: 2,
  items: [
    {
      id: "order-item-1",
      productId: "product-1",
      productVariantId: "variant-1",
      productTitle: "Classic T-Shirt",
      variantName: "Large / Blue",
      variantCode: "TSHIRT-L-BLUE",
      unitPrice: 20,
      quantity: 2,
      lineTotal: 40,
      createdAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

test("OrdersService places an order through the repository", async () => {
  let placedForUserId: string | null = null;
  const service = new OrdersService({
    async placeOrder(userId) {
      placedForUserId = userId;
      return order;
    },
    async getOrderById() {
      return order;
    },
  });

  const result = await service.placeOrder("user-1");

  assert.equal(placedForUserId, "user-1");
  assert.equal(result.id, "order-1");
});

test("OrdersService rejects missing orders", async () => {
  const service = new OrdersService({
    async placeOrder() {
      return order;
    },
    async getOrderById() {
      return null;
    },
  });

  await assert.rejects(
    () => service.getOrderById("user-1", "order-9"),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 404 &&
      error.message === "Order not found.",
  );
});
