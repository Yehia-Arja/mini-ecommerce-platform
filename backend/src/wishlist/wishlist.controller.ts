import type { NextFunction, Request, Response } from "express";

import { sendNoContent, sendSuccess } from "../http/api-response.js";
import { requireAuthenticatedUserId } from "../http/request-user.js";
import type { WishlistServiceContract } from "./wishlist.service.js";
import {
  parseAddWishlistItemInput,
  parseWishlistItemId,
} from "./wishlist.validation.js";

export type WishlistController = {
  getWishlist: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
  addItem: (
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

export function createWishlistController(
  wishlistService: WishlistServiceContract,
): WishlistController {
  return {
    async getWishlist(request, response, next) {
      try {
        const result = await wishlistService.getWishlistByUserId(
          requireAuthenticatedUserId(request),
        );

        sendSuccess(response, 200, result, "Wishlist retrieved successfully.");
      } catch (error) {
        next(error);
      }
    },
    async addItem(request, response, next) {
      try {
        const result = await wishlistService.addItem(
          requireAuthenticatedUserId(request),
          parseAddWishlistItemInput(request.body),
        );

        sendSuccess(response, 200, result, "Item added to wishlist successfully.");
      } catch (error) {
        next(error);
      }
    },
    async removeItem(request, response, next) {
      try {
        await wishlistService.removeItem(
          requireAuthenticatedUserId(request),
          parseWishlistItemId(request.params.wishlistItemId),
        );

        sendNoContent(response);
      } catch (error) {
        next(error);
      }
    },
  };
}
