import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  public code: string;
  constructor(code: string, message?: string) {
    super(message || code);
    this.name = "ValidationError";
    this.code = code;
  }
}

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof NotFoundError) {
    return apiError(error.message, 404);
  }
  if (error instanceof ValidationError) {
    return apiError(error.message, 400);
  }
  if (error instanceof ZodError) {
    return apiError(error.issues.map((e) => e.message).join(", "), 400);
  }
  if (
    error instanceof Error &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    const meta = (error as { meta?: { target?: string[] } }).meta;
    const fields = meta?.target?.join(", ") || "unknown field";
    return NextResponse.json(
      { error: `Duplicate record — a conflicting entry already exists on: ${fields}`, code: "DUPLICATE_RECORD" },
      { status: 409 }
    );
  }
  if (
    error instanceof Error &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  ) {
    return apiError("Record not found or was deleted by another user", 404);
  }
  Sentry.captureException(error);
  console.error("Unhandled API error", error instanceof Error ? error.message : "Unknown");
  return apiError("Internal server error", 500);
}

export function extractRequestMeta(req: Request): { ipAddress: string; userAgent: string } {
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}
