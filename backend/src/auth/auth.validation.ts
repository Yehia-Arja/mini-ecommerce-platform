import { HttpError } from "../http/errors.js";
import type { LoginInput } from "./auth.types.js";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Request body must be a JSON object.");
  }

  return value as RawRecord;
}

function readTrimmedString(
  source: RawRecord,
  key: string,
  options: {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
  } = {},
): string | null {
  const rawValue = source[key];

  if (rawValue == null || rawValue === "") {
    if (options.required) {
      throw new HttpError(400, `Field "${key}" is required.`);
    }

    return null;
  }

  if (typeof rawValue !== "string") {
    throw new HttpError(400, `Field "${key}" must be a string.`);
  }

  const trimmedValue = rawValue.trim();

  if (!trimmedValue && options.required) {
    throw new HttpError(400, `Field "${key}" is required.`);
  }

  if (options.minLength && trimmedValue.length < options.minLength) {
    throw new HttpError(
      400,
      `Field "${key}" must be at least ${options.minLength} characters long.`,
    );
  }

  if (options.maxLength && trimmedValue.length > options.maxLength) {
    throw new HttpError(
      400,
      `Field "${key}" must be at most ${options.maxLength} characters long.`,
    );
  }

  return trimmedValue || null;
}

function normalizeEmail(rawEmail: string): string {
  return rawEmail.toLowerCase();
}

function assertEmail(email: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new HttpError(400, "Field \"email\" must be a valid email address.");
  }
}

export function parseLoginInput(
  body: unknown,
  ipAddress: string | null,
  userAgent: string | null,
): LoginInput {
  const source = asRecord(body);
  const email = readTrimmedString(source, "email", {
    required: true,
    maxLength: 255,
  });
  const password = readTrimmedString(source, "password", {
    required: true,
    minLength: 8,
    maxLength: 255,
  });

  if (!email || !password) {
    throw new HttpError(400, "Email and password are required.");
  }

  const normalizedEmail = normalizeEmail(email);
  assertEmail(normalizedEmail);

  return {
    email: normalizedEmail,
    password,
    ipAddress,
    userAgent,
  };
}
