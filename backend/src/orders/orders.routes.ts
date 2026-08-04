import { Router, type RequestHandler } from "express";

import type { OrdersController } from "./orders.controller.js";

export function createOrdersRoutes(
  ordersController: OrdersController,
  requireAuth: RequestHandler,
) {
  const router = Router();

  router.post("/", requireAuth, ordersController.placeOrder);
  router.get("/:orderId", requireAuth, ordersController.getOrderById);

  return router;
}
