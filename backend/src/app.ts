import cors from "cors";
import express, { type Router } from "express";

import type { AppConfig } from "./config.js";
import { sendSuccess } from "./http/api-response.js";
import { errorHandler, notFoundHandler } from "./http/errors.js";

type AppDependencies = {
  authRouter?: Router;
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
