import type { NextFunction, Request, Response } from "express";

import { sendNoContent, sendSuccess } from "../http/api-response.js";
import { requireAuthenticatedUserId } from "../http/request-user.js";
import type { CartServiceContract } from "./cart.service.js";
import {
  parseAddCartItemInput,
  parseCartItemId,
  parseUpdateCartItemInput,
} from "./cart.validation.js";

export type CartController = {
  getCart: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
  addItem: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
  updateItem: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
  removeItem: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
};

export function createCartController(cartService: CartServiceContract): CartController {
  return {
    async getCart(request, response, next) {
      try {
        const result = await cartService.getCartByUserId(
          requireAuthenticatedUserId(request),
        );

        sendSuccess(response, 200, result, "Cart retrieved successfully.");
      } catch (error) {
        next(error);
      }
    },
    async addItem(request, response, next) {
      try {
        const result = await cartService.addItem(
          requireAuthenticatedUserId(request),
          parseAddCartItemInput(request.body),
        );

        sendSuccess(response, 200, result, "Item added to cart successfully.");
      } catch (error) {
        next(error);
      }
    },
    async updateItem(request, response, next) {
      try {
        const result = await cartService.updateItem(
          requireAuthenticatedUserId(request),
          parseCartItemId(request.params.cartItemId),
          parseUpdateCartItemInput(request.body),
        );

        sendSuccess(response, 200, result, "Cart item updated successfully.");
      } catch (error) {
        next(error);
      }
    },
    async removeItem(request, response, next) {
      try {
        await cartService.removeItem(
          requireAuthenticatedUserId(request),
          parseCartItemId(request.params.cartItemId),
        );

        sendNoContent(response);
      } catch (error) {
        next(error);
      }
    },
  };
}
