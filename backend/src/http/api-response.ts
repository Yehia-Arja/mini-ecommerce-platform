import type { Response } from "express";

type SuccessEnvelope<T> = {
  success: true;
  message: string;
  data: T;
};

type ErrorEnvelope = {
  success: false;
  message: string;
  errors: Record<string, string> | null;
};

export function sendSuccess<T>(
  response: Response,
  statusCode: number,
  data: T,
  message: string,
) {
  const payload: SuccessEnvelope<T> = {
    success: true,
    message,
    data,
  };

  return response.status(statusCode).json(payload);
}

export function sendNoContent(response: Response) {
  return response.status(204).send();
}

export function sendError(
  response: Response,
  statusCode: number,
  message: string,
  errors: Record<string, string> | null = null,
) {
  const payload: ErrorEnvelope = {
    success: false,
    message,
    errors,
  };

  return response.status(statusCode).json(payload);
}
