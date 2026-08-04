import { randomBytes } from "node:crypto";

type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
  maxAge?: number;
  path?: string;
};

export function generateSessionId(): string {
  return randomBytes(32).toString("base64url");
}

export function parseCookieHeader(
  cookieHeader: string | undefined,
): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex < 0) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

export function readCookieValue(
  cookieHeader: string | undefined,
  cookieName: string,
): string | null {
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[cookieName] ?? null;
}

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): string {
  const segments = [`${name}=${encodeURIComponent(value)}`];

  segments.push(`Path=${options.path ?? "/"}`);

  if (options.httpOnly ?? true) {
    segments.push("HttpOnly");
  }

  if (options.secure) {
    segments.push("Secure");
  }

  if (options.sameSite) {
    segments.push(`SameSite=${options.sameSite}`);
  }

  if (typeof options.maxAge === "number") {
    segments.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }

  return segments.join("; ");
}

function buildTokenCookie(
  name: string,
  token: string,
  maxAgeSeconds: number,
  secure: boolean,
  path: string,
  sameSite: "Lax" | "Strict",
): string {
  return serializeCookie(name, token, {
    httpOnly: true,
    secure,
    sameSite,
    path,
    maxAge: maxAgeSeconds,
  });
}

export function buildAccessTokenCookie(
  name: string,
  token: string,
  ttlMinutes: number,
  secure: boolean,
): string {
  return buildTokenCookie(name, token, ttlMinutes * 60, secure, "/", "Lax");
}

export function buildRefreshTokenCookie(
  name: string,
  token: string,
  ttlDays: number,
  secure: boolean,
): string {
  return buildTokenCookie(
    name,
    token,
    ttlDays * 24 * 60 * 60,
    secure,
    "/api/auth",
    "Lax",
  );
}

function buildExpiredCookie(
  name: string,
  secure: boolean,
  path: string,
): string {
  return serializeCookie(name, "", {
    httpOnly: true,
    secure,
    sameSite: "Lax",
    path,
    maxAge: 0,
  });
}

export function buildExpiredAccessTokenCookie(
  name: string,
  secure: boolean,
): string {
  return buildExpiredCookie(name, secure, "/");
}

export function buildExpiredRefreshTokenCookie(
  name: string,
  secure: boolean,
): string {
  return buildExpiredCookie(name, secure, "/api/auth");
}
