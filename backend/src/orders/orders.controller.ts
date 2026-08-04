import type { NextFunction, Request, Response } from "express";

import { requireAuthenticatedUserId } from "../http/request-user.js";
import { sendSuccess } from "../http/api-response.js";
import type { OrdersServiceContract } from "./orders.service.js";
import { parseOrderId } from "./orders.validation.js";

export type OrdersController = {
  placeOrder: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
  getOrderById: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
};

export function createOrdersController(
  ordersService: OrdersServiceContract,
): OrdersController {
  return {
    async placeOrder(request, response, next) {
      try {
        const order = await ordersService.placeOrder(
          requireAuthenticatedUserId(request),
        );

        sendSuccess(response, 201, order, "Order placed successfully.");
      } catch (error) {
        next(error);
      }
    },
    async getOrderById(request, response, next) {
      try {
        const order = await ordersService.getOrderById(
          requireAuthenticatedUserId(request),
          parseOrderId(request.params.orderId),
        );

        sendSuccess(response, 200, order, "Order retrieved successfully.");
      } catch (error) {
        next(error);
      }
    },
  };
}
