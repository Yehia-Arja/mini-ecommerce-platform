import { HttpError } from "../http/errors.js";
import type { AuthRepositoryContract } from "./auth.repository.js";
import { verifyPassword } from "./password.js";
import { generateSessionId } from "./session.js";
import type {
  AuthSessionBundle,
  AuthenticatedUser,
  LoginInput,
} from "./auth.types.js";

type AuthTokenConfig = {
  accessTokenTtlMinutes: number;
  refreshTokenTtlDays: number;
};

export class AuthService {
  constructor(
    private readonly repository: AuthRepositoryContract,
    private readonly tokenConfig: AuthTokenConfig,
  ) {}

  async login(input: LoginInput): Promise<AuthSessionBundle> {
    const user = await this.repository.findUserByEmail(input.email);

    if (!user?.password) {
      throw new HttpError(401, "Invalid email or password.");
    }

    if (user.status !== "active") {
      throw new HttpError(403, `This account is currently ${user.status}.`);
    }

    const passwordMatches = await verifyPassword(input.password, user.password);

    if (!passwordMatches) {
      throw new HttpError(401, "Invalid email or password.");
    }

    return this.repository.issueTokenBundle(
      user.id,
      generateSessionId(),
      generateSessionId(),
      {
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        accessTokenTtlMinutes: this.tokenConfig.accessTokenTtlMinutes,
        refreshTokenTtlDays: this.tokenConfig.refreshTokenTtlDays,
      },
    );
  }

  async refresh(
    refreshTokenId: string | null,
    context: {
      ipAddress: string | null;
      userAgent: string | null;
    },
  ): Promise<AuthSessionBundle> {
    if (!refreshTokenId) {
      throw new HttpError(401, "Refresh token is required.");
    }

    const refreshSession = await this.repository.findRefreshTokenById(refreshTokenId);

    if (!refreshSession?.userId) {
      throw new HttpError(401, "Refresh token is invalid.");
    }

    if (refreshSession.revokedAt) {
      await this.repository.deleteSessionsByUserId(refreshSession.userId);
      throw new HttpError(401, "Refresh token is no longer valid.");
    }

    if (new Date(refreshSession.expiresAt).getTime() <= Date.now()) {
      await this.repository.deleteSessionById(refreshSession.id);
      throw new HttpError(401, "Refresh token has expired.");
    }

    if (!refreshSession.user) {
      await this.repository.deleteSessionById(refreshSession.id);
      throw new HttpError(401, "Refresh token is invalid.");
    }

    if (refreshSession.user.status !== "active") {
      await this.repository.deleteSessionsByUserId(refreshSession.userId);
      throw new HttpError(
        403,
        `This account is currently ${refreshSession.user.status}.`,
      );
    }

    const rotatedSession = await this.repository.rotateRefreshToken(
      refreshTokenId,
      generateSessionId(),
      generateSessionId(),
      {
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        accessTokenTtlMinutes: this.tokenConfig.accessTokenTtlMinutes,
        refreshTokenTtlDays: this.tokenConfig.refreshTokenTtlDays,
      },
    );

    if (!rotatedSession) {
      await this.repository.deleteSessionsByUserId(refreshSession.userId);
      throw new HttpError(401, "Refresh token is no longer valid.");
    }

    return rotatedSession;
  }

  async getCurrentUser(
    accessTokenId: string | null,
  ): Promise<AuthenticatedUser | null> {
    if (!accessTokenId) {
      return null;
    }

    const session = await this.repository.findAccessTokenById(accessTokenId);
    return session?.user ?? null;
  }

  async logout(
    accessTokenId: string | null,
    refreshTokenId: string | null,
  ): Promise<void> {
    await this.repository.deleteSessionsByIds(
      [accessTokenId, refreshTokenId].filter(
        (tokenId): tokenId is string => Boolean(tokenId),
      ),
    );
  }
}
