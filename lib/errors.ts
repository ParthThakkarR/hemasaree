/**
 * Centralized error classes for the application.
 * Provides consistent error handling across all layers.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400, true, "VALIDATION_ERROR");
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, true, "AUTH_ERROR");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, true, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, true, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409, true, "CONFLICT");
  }
}

export class PaymentError extends AppError {
  constructor(message = "Payment failed") {
    super(message, 402, true, "PAYMENT_ERROR");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429, true, "RATE_LIMIT_EXCEEDED");
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, 500, false, "DATABASE_ERROR");
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service error", statusCode = 502) {
    super(message, statusCode, true, "EXTERNAL_SERVICE_ERROR");
  }
}

/**
 * Error handler utility for API routes
 */
export function handleApiError(error: unknown): { message: string; statusCode: number; code?: string } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> };
    switch (prismaError.code) {
      case 'P2002':
        return { message: "Unique constraint violation", statusCode: 409, code: "UNIQUE_CONSTRAINT" };
      case 'P2025':
        return { message: "Record not found", statusCode: 404, code: "RECORD_NOT_FOUND" };
      case 'P2034':
        return { message: "Transaction conflict", statusCode: 409, code: "TRANSACTION_CONFLICT" };
      default:
        console.error("Unhandled Prisma error:", prismaError.code, prismaError.meta);
        return { message: "Database error", statusCode: 500, code: "DATABASE_ERROR" };
    }
  }

  // Log unexpected errors
  console.error("Unexpected error:", error);
  return { message: "Internal server error", statusCode: 500, code: "INTERNAL_ERROR" };
}
