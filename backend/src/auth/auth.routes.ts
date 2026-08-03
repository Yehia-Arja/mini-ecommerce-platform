import { Router } from "express";

import type { AuthController } from "./auth.controller.js";

export function createAuthRoutes(authController: AuthController) {
  const router = Router();

  router.post("/login", authController.login);
  router.post("/refresh", authController.refresh);
  router.get("/me", authController.me);
  router.post("/logout", authController.logout);

  return router;
}
