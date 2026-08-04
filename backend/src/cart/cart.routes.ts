import { Router, type RequestHandler } from "express";

import type { CartController } from "./cart.controller.js";

export function createCartRoutes(
  cartController: CartController,
  requireAuth: RequestHandler,
) {
  const router = Router();

  router.get("/", requireAuth, cartController.getCart);
  router.post("/items", requireAuth, cartController.addItem);
  router.patch("/items/:cartItemId", requireAuth, cartController.updateItem);
  router.delete("/items/:cartItemId", requireAuth, cartController.removeItem);

  return router;
}
