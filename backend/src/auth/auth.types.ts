export const USER_STATUSES = ["active", "pending", "suspended"] as const;
export const AUTH_TOKEN_TYPES = ["access", "refresh"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];
export type AuthTokenType = (typeof AUTH_TOKEN_TYPES)[number];

export type AuthenticatedUser = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  status: UserStatus;
  emailVerifiedAt: string | null;
  userType: string;
  loginCount: number;
  lastLoginIp: string | null;
  lastLoginAt: string | null;
  language: string;
  countryCode: string | null;
  registrationIp: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export type TokenSessionRecord = {
  id: string;
  userId: string;
  user: AuthenticatedUser;
  tokenType: AuthTokenType;
  expiresAt: string;
  revokedAt: string | null;
};

export type RefreshSessionLookup = {
  id: string;
  userId: string | null;
  user: AuthenticatedUser | null;
  expiresAt: string;
  revokedAt: string | null;
  replacedBySessionId: string | null;
};

export type AuthSessionBundle = {
  user: AuthenticatedUser;
  accessToken: TokenSessionRecord;
  refreshToken: TokenSessionRecord;
};
