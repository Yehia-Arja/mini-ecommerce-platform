import type { NextFunction, Request, Response } from "express";

import { sendNoContent, sendSuccess } from "../http/api-response.js";
import { HttpError } from "../http/errors.js";
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

function requireUserId(request: Request): string {
  const userId = request.user?.id;

  if (!userId) {
    throw new HttpError(401, "Authentication is required.");
  }

  return userId;
}

export function createCartController(cartService: CartServiceContract): CartController {
  return {
    async getCart(request, response, next) {
      try {
        const result = await cartService.getCartByUserId(requireUserId(request));

        sendSuccess(response, 200, result, "Cart retrieved successfully.");
      } catch (error) {
        next(error);
      }
    },
    async addItem(request, response, next) {
      try {
        const result = await cartService.addItem(
          requireUserId(request),
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
          requireUserId(request),
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
          requireUserId(request),
          parseCartItemId(request.params.cartItemId),
        );

        sendNoContent(response);
      } catch (error) {
        next(error);
      }
    },
  };
}
