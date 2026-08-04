import assert from "node:assert/strict";
import test from "node:test";

import {
  buildExpiredRefreshTokenCookie,
  buildRefreshTokenCookie,
  parseCookieHeader,
} from "../session.js";

test("refresh token cookie is scoped to /api/auth so refresh and logout can both access it", () => {
  const cookie = buildRefreshTokenCookie(
    "test_refresh",
    "refresh-token-id",
    30,
    false,
  );

  assert.match(cookie, /Path=\/api\/auth/);
  assert.doesNotMatch(cookie, /Path=\/api\/auth\/refresh/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
});

test("expired refresh token cookie clears the same /api/auth scope", () => {
  const cookie = buildExpiredRefreshTokenCookie("test_refresh", false);

  assert.match(cookie, /Path=\/api\/auth/);
  assert.match(cookie, /Max-Age=0/);
});

test("parseCookieHeader reads refresh token cookies from request headers", () => {
  const cookies = parseCookieHeader(
    "test_access=access-token; test_refresh=refresh-token-id",
  );

  assert.deepEqual(cookies, {
    test_access: "access-token",
    test_refresh: "refresh-token-id",
  });
});
