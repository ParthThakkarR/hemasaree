import { NextResponse } from "next/server";

/**
 * Standardized API response envelope.
 * All API responses should use these helpers for consistency.
 */

interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

interface PaginatedData<T> {
  items: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

/**
 * Success response (200 OK).
 */
export function successResponse<T>(data: T, message?: string): NextResponse {
  const body: SuccessResponse<T> = { success: true, data };
  if (message) body.message = message;
  return NextResponse.json(body);
}

/**
 * Created response (201 Created).
 */
export function createdResponse<T>(data: T, message?: string): NextResponse {
  const body: SuccessResponse<T> = { success: true, data };
  if (message) body.message = message;
  return NextResponse.json(body, { status: 201 });
}

/**
 * No content response (204 No Content).
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Error response (with custom status code).
 */
export function errorResponse(
  message: string,
  status: number = 500,
  code?: string
): NextResponse {
  const body: ErrorResponse = { success: false, error: message };
  if (code) body.code = code;
  return NextResponse.json(body, { status });
}

/**
 * Paginated success response.
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  currentPage: number,
  limit: number,
  message?: string
): NextResponse {
  const body: SuccessResponse<PaginatedData<T>> = {
    success: true,
    data: {
      items,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage,
        limit,
      },
    },
  };
  if (message) body.message = message;
  return NextResponse.json(body);
}
