import type { NextFunction, Request, Response } from "express";

import { sendError } from "./api-response.js";

export class HttpError extends Error {
  readonly statusCode: number;
  readonly details: Record<string, string> | undefined;

  constructor(
    statusCode: number,
    message: string,
    details?: Record<string, string>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction,
) {
  void next;

  if (error instanceof SyntaxError && "body" in error) {
    sendError(response, 400, "Request body must be valid JSON.");
    return;
  }

  if (error instanceof HttpError) {
    sendError(response, error.statusCode, error.message, error.details ?? null);
    return;
  }

  console.error(error);
  sendError(response, 500, "An unexpected error occurred.");
}

export function notFoundHandler(_request: Request, response: Response) {
  sendError(response, 404, "Route not found.");
}
