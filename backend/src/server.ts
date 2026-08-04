import "dotenv/config";

import { createAuthController } from "./auth/auth.controller.js";
import { createAuthRoutes } from "./auth/auth.routes.js";
import { AuthRepository } from "./auth/auth.repository.js";
import { AuthService } from "./auth/auth.service.js";
import { createApp } from "./app.js";
import { getServerConfig } from "./config.js";
import { Database } from "./db/database.js";

const config = getServerConfig();
const database = new Database(config.databaseUrl);
const authRepository = new AuthRepository(database);
const authService = new AuthService(authRepository, {
  accessTokenTtlMinutes: config.accessTokenTtlMinutes,
  refreshTokenTtlDays: config.refreshTokenTtlDays,
});
const authController = createAuthController(authService, config);
const authRouter = createAuthRoutes(authController);
const app = createApp(config, { authRouter });

const server = app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});

let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}. Shutting down gracefully.`);

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await database.close();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal).catch((error: unknown) => {
      console.error("Failed to shut down cleanly.");
      console.error(error);
      process.exitCode = 1;
    });
  });
}
