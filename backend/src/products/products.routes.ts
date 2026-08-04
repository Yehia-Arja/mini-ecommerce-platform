import { Router, type RequestHandler } from "express";

import type { ProductsController } from "./products.controller.js";

export function createProductsRoutes(
  productsController: ProductsController,
  requireAuth: RequestHandler,
) {
  const router = Router();

  router.get("/", requireAuth, productsController.listProducts);
  router.get("/:productId", requireAuth, productsController.getProductById);

  return router;
}
