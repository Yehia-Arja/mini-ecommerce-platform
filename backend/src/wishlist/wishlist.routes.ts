import { Router, type RequestHandler } from "express";

import type { WishlistController } from "./wishlist.controller.js";

export function createWishlistRoutes(
  wishlistController: WishlistController,
  requireAuth: RequestHandler,
) {
  const router = Router();

  router.get("/", requireAuth, wishlistController.getWishlist);
  router.post("/items", requireAuth, wishlistController.addItem);
  router.delete("/items/:wishlistItemId", requireAuth, wishlistController.removeItem);

  return router;
}
