const DEFAULT_PORT = 3000;
const DEFAULT_FRONTEND_URL = "http://localhost:5173";

export type AppConfig = {
  port: number;
  frontendUrl: string;
};

export function parsePort(rawPort: string | undefined): number {
  if (!rawPort) {
    return DEFAULT_PORT;
  }

  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    return DEFAULT_PORT;
  }

  return parsedPort;
}

export function getAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: parsePort(env.PORT),
    frontendUrl: env.FRONTEND_URL ?? DEFAULT_FRONTEND_URL,
  };
}
