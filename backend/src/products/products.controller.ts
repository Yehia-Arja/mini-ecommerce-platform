import type { NextFunction, Request, Response } from "express";

import { sendSuccess } from "../http/api-response.js";
import type { ProductsServiceContract } from "./products.service.js";
import {
  parseProductId,
  parseProductsPaginationQuery,
} from "./products.validation.js";

export type ProductsController = {
  listProducts: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
  getProductById: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
};

export function createProductsController(
  productsService: ProductsServiceContract,
): ProductsController {
  return {
    async listProducts(request, response, next) {
      try {
        const pagination = parseProductsPaginationQuery(
          request.query as Record<string, unknown>,
        );
        const result = await productsService.listProducts(pagination);

        sendSuccess(
          response,
          200,
          result,
          "Products retrieved successfully.",
        );
      } catch (error) {
        next(error);
      }
    },
    async getProductById(request, response, next) {
      try {
        const productId = parseProductId(request.params.productId);
        const result = await productsService.getProductById(productId);

        sendSuccess(
          response,
          200,
          result,
          "Product retrieved successfully.",
        );
      } catch (error) {
        next(error);
      }
    },
  };
}
