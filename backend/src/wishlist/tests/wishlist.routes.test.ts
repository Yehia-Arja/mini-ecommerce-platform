import assert from "node:assert/strict";
import test from "node:test";
import type { RequestHandler } from "express";

import { createApp } from "../../app.js";
import type { WishlistController } from "../wishlist.controller.js";
import { createWishlistRoutes } from "../wishlist.routes.js";

const testConfig = {
  frontendUrl: "http://localhost:5173",
  nodeEnv: "test" as const,
  accessTokenCookieName: "test_access",
  refreshTokenCookieName: "test_refresh",
  accessTokenTtlMinutes: 15,
  refreshTokenTtlDays: 30,
  cookieSecure: false,
};

test("wishlist route requires authentication before delegating to the controller", async () => {
  let middlewareCalls = 0;
  let getWishlistCalls = 0;

  const controller: WishlistController = {
    async getWishlist(_request, response) {
      getWishlistCalls += 1;
      response.status(200).json({
        success: true,
        message: "wishlist",
        data: { ok: true },
      });
    },
    async addItem(_request, response) {
      response.status(200).json({
        success: true,
        message: "add",
        data: { ok: true },
      });
    },
    async removeItem(_request, response) {
      response.status(204).send();
    },
  };

  const requireAuth: RequestHandler = (_request, _response, next) => {
    middlewareCalls += 1;
    next();
  };

  const app = createApp(testConfig, {
    wishlistRouter: createWishlistRoutes(controller, requireAuth),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/api/wishlist`);
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      data: {
        ok: boolean;
      };
    };

    assert.equal(response.status, 200);
    assert.deepEqual(payload, {
      success: true,
      message: "wishlist",
      data: { ok: true },
    });
    assert.equal(middlewareCalls, 1);
    assert.equal(getWishlistCalls, 1);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});
