import type { PoolClient, QueryResultRow } from "pg";

import { Database } from "../db/database.js";
import type {
  AuthSessionBundle,
  AuthTokenType,
  AuthenticatedUser,
  RefreshSessionLookup,
  TokenSessionRecord,
  UserStatus,
} from "./auth.types.js";

export type AuthRepositoryContract = {
  findUserByEmail(email: string): Promise<AuthUserRecord | null>;
  issueTokenBundle(
    userId: string,
    accessTokenId: string,
    refreshTokenId: string,
    input: {
      ipAddress: string | null;
      userAgent: string | null;
      accessTokenTtlMinutes: number;
      refreshTokenTtlDays: number;
    },
  ): Promise<AuthSessionBundle>;
  findAccessTokenById(sessionId: string): Promise<TokenSessionRecord | null>;
  findRefreshTokenById(sessionId: string): Promise<RefreshSessionLookup | null>;
  rotateRefreshToken(
    refreshTokenId: string,
    accessTokenId: string,
    refreshTokenReplacementId: string,
    input: {
      ipAddress: string | null;
      userAgent: string | null;
      accessTokenTtlMinutes: number;
      refreshTokenTtlDays: number;
    },
  ): Promise<AuthSessionBundle | null>;
  deleteSessionById(sessionId: string): Promise<void>;
  deleteSessionsByIds(sessionIds: string[]): Promise<void>;
  deleteSessionsByUserId(userId: string): Promise<void>;
};

type DatabaseExecutor = Database | PoolClient;

type UserRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  password: string | null;
  phone_number: string | null;
  status: UserStatus;
  email_verified_at: string | null;
  user_type: string;
  login_count: number;
  last_login_ip: string | null;
  last_login_at: string | null;
  language: string;
  country_code: string | null;
  registration_ip: string | null;
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  id: string;
  user_id: string | null;
  token_type: AuthTokenType;
  expires_at: string;
  revoked_at: string | null;
  replaced_by_session_id: string | null;
};

type AuthUserRecord = AuthenticatedUser & {
  password: string | null;
};

const BASE_USER_SELECT = `
  SELECT
    users.id,
    users.first_name,
    users.last_name,
    users.email,
    users.password,
    users.phone_number,
    users.status,
    users.email_verified_at::TEXT,
    user_types.name AS user_type,
    users.login_count,
    users.last_login_ip,
    users.last_login_at::TEXT,
    users.language,
    users.country_code,
    users.registration_ip,
    users.created_at::TEXT,
    users.updated_at::TEXT
  FROM users
  INNER JOIN user_types
    ON user_types.id = users.user_type_id
`;

function mapUserRow(row: UserRow): AuthUserRecord {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    password: row.password,
    phoneNumber: row.phone_number,
    status: row.status,
    emailVerifiedAt: row.email_verified_at,
    userType: row.user_type,
    loginCount: row.login_count,
    lastLoginIp: row.last_login_ip,
    lastLoginAt: row.last_login_at,
    language: row.language,
    countryCode: row.country_code,
    registrationIp: row.registration_ip,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function stripPassword(user: AuthUserRecord): AuthenticatedUser {
  const { password: _password, ...safeUser } = user;

  void _password;

  return safeUser;
}

async function executeQuery<T extends QueryResultRow>(
  executor: DatabaseExecutor,
  text: string,
  values: readonly unknown[],
) {
  const query = executor.query.bind(executor) as (
    queryText: string,
    queryValues?: unknown[],
  ) => Promise<{ rows: T[]; rowCount?: number | null }>;

  return query(text, [...values]);
}

function createExpiryDate(minutesOrDays: number, unit: "minutes" | "days"): Date {
  const expiresAt = new Date();

  if (unit === "minutes") {
    expiresAt.setMinutes(expiresAt.getMinutes() + minutesOrDays);
    return expiresAt;
  }

  expiresAt.setDate(expiresAt.getDate() + minutesOrDays);
  return expiresAt;
}

export class AuthRepository implements AuthRepositoryContract {
  constructor(private readonly database: Database) {}

  async findUserByEmail(email: string): Promise<AuthUserRecord | null> {
    const result = await this.database.query<UserRow>(
      `${BASE_USER_SELECT} WHERE users.email = $1`,
      [email],
    );

    const row = result.rows[0];
    return row ? mapUserRow(row) : null;
  }

  async issueTokenBundle(
    userId: string,
    accessTokenId: string,
    refreshTokenId: string,
    input: {
      ipAddress: string | null;
      userAgent: string | null;
      accessTokenTtlMinutes: number;
      refreshTokenTtlDays: number;
    },
  ): Promise<AuthSessionBundle> {
    return this.database.withTransaction(async (client) => {
      await client.query(
        `
          UPDATE users
          SET
            login_count = login_count + 1,
            last_login_ip = $2,
            last_login_at = NOW(),
            updated_at = NOW()
          WHERE id = $1
        `,
        [userId, input.ipAddress],
      );

      const user = await this.findUserByIdWithExecutor(client, userId);

      if (!user) {
        throw new Error("Failed to load authenticated user.");
      }

      const accessToken = await this.insertTokenSession(client, {
        sessionId: accessTokenId,
        userId,
        tokenType: "access",
        expiresAt: createExpiryDate(input.accessTokenTtlMinutes, "minutes"),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        user,
      });

      const refreshToken = await this.insertTokenSession(client, {
        sessionId: refreshTokenId,
        userId,
        tokenType: "refresh",
        expiresAt: createExpiryDate(input.refreshTokenTtlDays, "days"),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        user,
      });

      return {
        user,
        accessToken,
        refreshToken,
      };
    });
  }

  async findAccessTokenById(sessionId: string): Promise<TokenSessionRecord | null> {
    return this.database.withTransaction(async (client) => {
      const sessionResult = await executeQuery<SessionRow>(
        client,
        `
          SELECT
            id,
            user_id,
            token_type,
            expires_at::TEXT,
            revoked_at::TEXT,
            replaced_by_session_id
          FROM sessions
          WHERE id = $1
            AND token_type = 'access'
            AND revoked_at IS NULL
            AND expires_at > NOW()
          FOR UPDATE
        `,
        [sessionId],
      );

      const session = sessionResult.rows[0];

      if (!session?.user_id) {
        return null;
      }

      await executeQuery(
        client,
        `
          UPDATE sessions
          SET last_activity = $2
          WHERE id = $1
        `,
        [sessionId, Math.floor(Date.now() / 1000)],
      );

      const user = await this.findUserByIdWithExecutor(client, session.user_id);

      if (!user) {
        return null;
      }

      return {
        id: session.id,
        userId: session.user_id,
        user,
        tokenType: session.token_type,
        expiresAt: session.expires_at,
        revokedAt: session.revoked_at,
      };
    });
  }

  async findRefreshTokenById(
    sessionId: string,
  ): Promise<RefreshSessionLookup | null> {
    const sessionResult = await this.database.query<SessionRow>(
      `
        SELECT
          id,
          user_id,
          token_type,
          expires_at::TEXT,
          revoked_at::TEXT,
          replaced_by_session_id
        FROM sessions
        WHERE id = $1
          AND token_type = 'refresh'
      `,
      [sessionId],
    );

    const session = sessionResult.rows[0];

    if (!session) {
      return null;
    }

    const user = session.user_id
      ? await this.findUserById(session.user_id)
      : null;

    return {
      id: session.id,
      userId: session.user_id,
      user,
      expiresAt: session.expires_at,
      revokedAt: session.revoked_at,
      replacedBySessionId: session.replaced_by_session_id,
    };
  }

  async rotateRefreshToken(
    refreshTokenId: string,
    accessTokenId: string,
    refreshTokenReplacementId: string,
    input: {
      ipAddress: string | null;
      userAgent: string | null;
      accessTokenTtlMinutes: number;
      refreshTokenTtlDays: number;
    },
  ): Promise<AuthSessionBundle | null> {
    return this.database.withTransaction(async (client) => {
      const rotationResult = await executeQuery<{ user_id: string }>(
        client,
        `
          UPDATE sessions
          SET
            revoked_at = NOW(),
            replaced_by_session_id = $2
          WHERE id = $1
            AND token_type = 'refresh'
            AND user_id IS NOT NULL
            AND revoked_at IS NULL
            AND replaced_by_session_id IS NULL
            AND expires_at > NOW()
          RETURNING user_id
        `,
        [refreshTokenId, refreshTokenReplacementId],
      );

      const rotatedSession = rotationResult.rows[0];

      if (!rotatedSession?.user_id) {
        return null;
      }

      const user = await this.findUserByIdWithExecutor(client, rotatedSession.user_id);

      if (!user) {
        return null;
      }

      const accessToken = await this.insertTokenSession(client, {
        sessionId: accessTokenId,
        userId: rotatedSession.user_id,
        tokenType: "access",
        expiresAt: createExpiryDate(input.accessTokenTtlMinutes, "minutes"),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        user,
      });

      const refreshToken = await this.insertTokenSession(client, {
        sessionId: refreshTokenReplacementId,
        userId: rotatedSession.user_id,
        tokenType: "refresh",
        expiresAt: createExpiryDate(input.refreshTokenTtlDays, "days"),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        user,
      });

      return {
        user,
        accessToken,
        refreshToken,
      };
    });
  }

  async deleteSessionById(sessionId: string): Promise<void> {
    await this.database.query("DELETE FROM sessions WHERE id = $1", [sessionId]);
  }

  async deleteSessionsByIds(sessionIds: string[]): Promise<void> {
    const uniqueSessionIds = [...new Set(sessionIds.filter(Boolean))];

    if (!uniqueSessionIds.length) {
      return;
    }

    await this.database.query("DELETE FROM sessions WHERE id = ANY($1::varchar[])", [
      uniqueSessionIds,
    ]);
  }

  async deleteSessionsByUserId(userId: string): Promise<void> {
    await this.database.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
  }

  private async findUserById(userId: string): Promise<AuthenticatedUser | null> {
    const result = await this.database.query<UserRow>(
      `${BASE_USER_SELECT} WHERE users.id = $1`,
      [userId],
    );

    const row = result.rows[0];
    return row ? stripPassword(mapUserRow(row)) : null;
  }

  private async findUserByIdWithExecutor(
    executor: DatabaseExecutor,
    userId: string,
  ): Promise<AuthenticatedUser | null> {
    const result = await executeQuery<UserRow>(
      executor,
      `${BASE_USER_SELECT} WHERE users.id = $1`,
      [userId],
    );

    const row = result.rows[0];
    return row ? stripPassword(mapUserRow(row)) : null;
  }

  private async insertTokenSession(
    executor: DatabaseExecutor,
    input: {
      sessionId: string;
      userId: string;
      tokenType: AuthTokenType;
      expiresAt: Date;
      ipAddress: string | null;
      userAgent: string | null;
      user: AuthenticatedUser;
    },
  ): Promise<TokenSessionRecord> {
    await executeQuery(
      executor,
      `
        INSERT INTO sessions (
          id,
          user_id,
          ip_address,
          user_agent,
          payload,
          token_type,
          expires_at,
          last_activity
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        input.sessionId,
        input.userId,
        input.ipAddress,
        input.userAgent,
        JSON.stringify({
          userId: input.userId,
          tokenType: input.tokenType,
        }),
        input.tokenType,
        input.expiresAt.toISOString(),
        Math.floor(Date.now() / 1000),
      ],
    );

    return {
      id: input.sessionId,
      userId: input.userId,
      user: input.user,
      tokenType: input.tokenType,
      expiresAt: input.expiresAt.toISOString(),
      revokedAt: null,
    };
  }
}
