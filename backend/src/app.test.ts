import test from "node:test";
import assert from "node:assert/strict";

import { createApp } from "./app.js";
import { getAppConfig, parsePort } from "./config.js";

test("parsePort falls back to the default for invalid values", () => {
  assert.equal(parsePort(undefined), 3000);
  assert.equal(parsePort(""), 3000);
  assert.equal(parsePort("abc"), 3000);
  assert.equal(parsePort("-1"), 3000);
});

test("getAppConfig uses environment overrides when provided", () => {
  const config = getAppConfig({
    PORT: "4100",
    FRONTEND_URL: "http://localhost:4173",
  });

  assert.deepEqual(config, {
    port: 4100,
    frontendUrl: "http://localhost:4173",
  });
});

test("health endpoint returns the expected payload", async () => {
  const app = createApp({
    port: 3000,
    frontendUrl: "http://localhost:5173",
  });

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected server to listen on a numeric port");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    const payload = (await response.json()) as {
      status: string;
      message: string;
    };

    assert.equal(response.status, 200);
    assert.deepEqual(payload, {
      status: "ok",
      message: "Backend is running",
    });
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
