const DEFAULT_PORT = 3000;
const DEFAULT_FRONTEND_URL = "http://localhost:5173";
const DEFAULT_ACCESS_TOKEN_COOKIE_NAME = "mini_ecommerce_access";
const DEFAULT_REFRESH_TOKEN_COOKIE_NAME = "mini_ecommerce_refresh";
const DEFAULT_ACCESS_TOKEN_TTL_MINUTES = 15;
const DEFAULT_REFRESH_TOKEN_TTL_DAYS = 30;
const DEFAULT_COOKIE_SECURE = false;

export type AppEnvironment = "development" | "test" | "production";

export type AppConfig = {
  frontendUrl: string;
  nodeEnv: AppEnvironment;
  accessTokenCookieName: string;
  refreshTokenCookieName: string;
  accessTokenTtlMinutes: number;
  refreshTokenTtlDays: number;
  cookieSecure: boolean;
};

export type ServerConfig = AppConfig & {
  port: number;
  databaseUrl: string;
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

function parsePositiveInteger(
  rawValue: string | undefined,
  defaultValue: number,
): number {
  if (!rawValue) {
    return defaultValue;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return defaultValue;
  }

  return parsedValue;
}

export function parseAccessTokenTtlMinutes(rawTtl: string | undefined): number {
  return parsePositiveInteger(rawTtl, DEFAULT_ACCESS_TOKEN_TTL_MINUTES);
}

export function parseRefreshTokenTtlDays(rawTtl: string | undefined): number {
  return parsePositiveInteger(rawTtl, DEFAULT_REFRESH_TOKEN_TTL_DAYS);
}

export function parseNodeEnv(rawNodeEnv: string | undefined): AppEnvironment {
  if (
    rawNodeEnv === "development" ||
    rawNodeEnv === "test" ||
    rawNodeEnv === "production"
  ) {
    return rawNodeEnv;
  }

  return "development";
}

function isLocalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1" ||
      parsedUrl.hostname === "::1"
    );
  } catch {
    return false;
  }
}

export function parseCookieSecure(
  rawValue: string | undefined,
  nodeEnv: AppEnvironment,
  frontendUrl: string,
): boolean {
  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  if (nodeEnv !== "production") {
    return DEFAULT_COOKIE_SECURE;
  }

  return !isLocalUrl(frontendUrl);
}

export function getAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const frontendUrl = env.FRONTEND_URL ?? DEFAULT_FRONTEND_URL;
  const nodeEnv = parseNodeEnv(env.NODE_ENV);

  return {
    frontendUrl,
    nodeEnv,
    accessTokenCookieName:
      env.ACCESS_TOKEN_COOKIE_NAME ?? DEFAULT_ACCESS_TOKEN_COOKIE_NAME,
    refreshTokenCookieName:
      env.REFRESH_TOKEN_COOKIE_NAME ?? DEFAULT_REFRESH_TOKEN_COOKIE_NAME,
    accessTokenTtlMinutes: parseAccessTokenTtlMinutes(
      env.ACCESS_TOKEN_TTL_MINUTES,
    ),
    refreshTokenTtlDays: parseRefreshTokenTtlDays(env.REFRESH_TOKEN_TTL_DAYS),
    cookieSecure: parseCookieSecure(env.COOKIE_SECURE, nodeEnv, frontendUrl),
  };
}

export function getServerConfig(
  env: NodeJS.ProcessEnv = process.env,
): ServerConfig {
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to start the backend server.");
  }

  return {
    ...getAppConfig(env),
    port: parsePort(env.PORT),
    databaseUrl,
  };
}
