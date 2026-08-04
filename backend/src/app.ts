import cors from "cors";
import express, { type Router } from "express";

import type { AppConfig } from "./config.js";
import { sendSuccess } from "./http/api-response.js";
import { errorHandler, notFoundHandler } from "./http/errors.js";

type AppDependencies = {
  authRouter?: Router;
  productsRouter?: Router;
  cartRouter?: Router;
  wishlistRouter?: Router;
};

export function createApp(config: AppConfig, dependencies: AppDependencies = {}) {
  const app = express();

  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
    }),
  );

  app.use(express.json());

  if (dependencies.authRouter) {
    app.use("/api/auth", dependencies.authRouter);
  }

  if (dependencies.productsRouter) {
    app.use("/api/products", dependencies.productsRouter);
  }

  if (dependencies.cartRouter) {
    app.use("/api/cart", dependencies.cartRouter);
  }

  if (dependencies.wishlistRouter) {
    app.use("/api/wishlist", dependencies.wishlistRouter);
  }

  app.get("/api/health", (_request, response) => {
    sendSuccess(
      response,
      200,
      {
        status: "ok",
      },
      "Backend is running.",
    );
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
