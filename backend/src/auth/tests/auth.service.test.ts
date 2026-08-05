import assert from "node:assert/strict";
import test from "node:test";

import { HttpError } from "../../http/errors.js";
import { AuthService } from "../auth.service.js";
import type {
  AuthSessionBundle,
  AuthenticatedUser,
  LoginInput,
  RefreshSessionLookup,
  TokenSessionRecord,
} from "../auth.types.js";

const baseUser: AuthenticatedUser = {
  id: "user-1",
  firstName: "Yehia",
  lastName: "Arja",
  email: "yehia@example.com",
  phoneNumber: null,
  status: "active",
  emailVerifiedAt: null,
  userType: "customer",
  loginCount: 0,
  lastLoginIp: null,
  lastLoginAt: null,
  language: "en",
  countryCode: null,
  registrationIp: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function createTokenSession(
  overrides: Partial<TokenSessionRecord> = {},
): TokenSessionRecord {
  return {
    id: "token-1",
    userId: baseUser.id,
    user: baseUser,
    tokenType: "access",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    revokedAt: null,
    ...overrides,
  };
}

function createAuthSessionBundle(): AuthSessionBundle {
  return {
    user: baseUser,
    accessToken: createTokenSession({
      id: "access-1",
      tokenType: "access",
    }),
    refreshToken: createTokenSession({
      id: "refresh-1",
      tokenType: "refresh",
    }),
  };
}

type RepositoryStub = {
  findUserByEmail: (email: string) => Promise<
    | (AuthenticatedUser & {
        password: string | null;
      })
    | null
  >;
  issueTokenBundle: (
    userId: string,
    accessTokenId: string,
    refreshTokenId: string,
    input: {
      ipAddress: string | null;
      userAgent: string | null;
      accessTokenTtlMinutes: number;
      refreshTokenTtlDays: number;
    },
  ) => Promise<AuthSessionBundle>;
  findAccessTokenById: (sessionId: string) => Promise<TokenSessionRecord | null>;
  findRefreshTokenById: (
    sessionId: string,
  ) => Promise<RefreshSessionLookup | null>;
  rotateRefreshToken: (
    refreshTokenId: string,
    accessTokenId: string,
    refreshTokenReplacementId: string,
    input: {
      ipAddress: string | null;
      userAgent: string | null;
      accessTokenTtlMinutes: number;
      refreshTokenTtlDays: number;
    },
  ) => Promise<AuthSessionBundle | null>;
  deleteSessionById: (sessionId: string) => Promise<void>;
  deleteSessionsByIds: (sessionIds: string[]) => Promise<void>;
  deleteSessionsByUserId: (userId: string) => Promise<void>;
};

function createService(overrides: Partial<RepositoryStub> = {}) {
  const repository: RepositoryStub = {
    async findUserByEmail() {
      return null;
    },
    async issueTokenBundle() {
      return createAuthSessionBundle();
    },
    async findAccessTokenById() {
      return null;
    },
    async findRefreshTokenById() {
      return null;
    },
    async rotateRefreshToken() {
      return createAuthSessionBundle();
    },
    async deleteSessionById() {},
    async deleteSessionsByIds() {},
    async deleteSessionsByUserId() {},
    ...overrides,
  };

  return new AuthService(repository, {
    accessTokenTtlMinutes: 15,
    refreshTokenTtlDays: 30,
  });
}

test("login rejects suspended users", async () => {
  const service = createService({
    async findUserByEmail() {
      return {
        ...baseUser,
        status: "suspended",
        password: "salt:hash",
      };
    },
  });

  const loginInput: LoginInput = {
    email: "yehia@example.com",
    password: "Customer#2026",
    ipAddress: "127.0.0.1",
    userAgent: "test",
  };

  await assert.rejects(
    service.login(loginInput),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 403 &&
      error.message === "This account is currently suspended.",
  );
});

test("getCurrentUser returns null when there is no access token", async () => {
  const service = createService();

  await assert.doesNotReject(async () => {
    const user = await service.getCurrentUser(null);
    assert.equal(user, null);
  });
});

test("refresh rejects revoked refresh tokens and invalidates user sessions", async () => {
  let deletedUserId: string | null = null;

  const service = createService({
    async findRefreshTokenById() {
      return {
        id: "refresh-1",
        userId: baseUser.id,
        user: baseUser,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        revokedAt: new Date().toISOString(),
        replacedBySessionId: "refresh-2",
      };
    },
    async deleteSessionsByUserId(userId) {
      deletedUserId = userId;
    },
  });

  await assert.rejects(
    service.refresh("refresh-1", {
      ipAddress: "127.0.0.1",
      userAgent: "test",
    }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 401 &&
      error.message === "Refresh token is no longer valid.",
  );

  assert.equal(deletedUserId, baseUser.id);
});
