import cors from "cors";
import express from "express";

import type { AppConfig } from "./config.js";

export function createApp(config: AppConfig) {
  const app = express();

  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
    }),
  );

  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      message: "Backend is running",
    });
  });

  return app;
}
