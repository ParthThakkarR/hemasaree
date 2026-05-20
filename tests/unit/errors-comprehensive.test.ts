// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AppError, ValidationError, AuthError, ForbiddenError,
  NotFoundError, ConflictError, PaymentError, RateLimitError,
  DatabaseError, ExternalServiceError, handleApiError,
} from '@/lib/errors';

describe('AppError', () => {
  it('creates error with message', () => {
    const error = new AppError('Test error', 500);
    expect(error.message).toBe('Test error');
  });

  it('sets statusCode', () => {
    const error = new AppError('Test', 400);
    expect(error.statusCode).toBe(400);
  });

  it('defaults isOperational to true', () => {
    const error = new AppError('Test', 500);
    expect(error.isOperational).toBe(true);
  });

  it('sets isOperational to false', () => {
    const error = new AppError('Test', 500, false);
    expect(error.isOperational).toBe(false);
  });

  it('sets code', () => {
    const error = new AppError('Test', 500, true, 'CUSTOM_CODE');
    expect(error.code).toBe('CUSTOM_CODE');
  });

  it('code is undefined when not provided', () => {
    const error = new AppError('Test', 500);
    expect(error.code).toBeUndefined();
  });

  it('extends Error', () => {
    const error = new AppError('Test', 500);
    expect(error).toBeInstanceOf(Error);
  });

  it('has name Error', () => {
    const error = new AppError('Test', 500);
    expect(error.name).toBe('Error');
  });

  it('has stack trace', () => {
    const error = new AppError('Test', 500);
    expect(error.stack).toBeDefined();
  });

  it('handles 200 status', () => {
    const error = new AppError('Test', 200);
    expect(error.statusCode).toBe(200);
  });

  it('handles 400 status', () => {
    const error = new AppError('Test', 400);
    expect(error.statusCode).toBe(400);
  });

  it('handles 401 status', () => {
    const error = new AppError('Test', 401);
    expect(error.statusCode).toBe(401);
  });

  it('handles 403 status', () => {
    const error = new AppError('Test', 403);
    expect(error.statusCode).toBe(403);
  });

  it('handles 404 status', () => {
    const error = new AppError('Test', 404);
    expect(error.statusCode).toBe(404);
  });

  it('handles 500 status', () => {
    const error = new AppError('Test', 500);
    expect(error.statusCode).toBe(500);
  });

  it('handles 503 status', () => {
    const error = new AppError('Test', 503);
    expect(error.statusCode).toBe(503);
  });

  it('handles empty message', () => {
    const error = new AppError('', 500);
    expect(error.message).toBe('');
  });

  it('handles long message', () => {
    const longMsg = 'A'.repeat(1000);
    const error = new AppError(longMsg, 500);
    expect(error.message).toBe(longMsg);
  });
});

describe('ValidationError', () => {
  it('has default message', () => {
    const error = new ValidationError();
    expect(error.message).toBe('Validation failed');
  });

  it('has custom message', () => {
    const error = new ValidationError('Invalid email');
    expect(error.message).toBe('Invalid email');
  });

  it('has statusCode 400', () => {
    const error = new ValidationError();
    expect(error.statusCode).toBe(400);
  });

  it('has code VALIDATION_ERROR', () => {
    const error = new ValidationError();
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('is operational', () => {
    const error = new ValidationError();
    expect(error.isOperational).toBe(true);
  });

  it('extends AppError', () => {
    const error = new ValidationError();
    expect(error).toBeInstanceOf(AppError);
  });

  it('extends Error', () => {
    const error = new ValidationError();
    expect(error).toBeInstanceOf(Error);
  });
});

describe('AuthError', () => {
  it('has default message', () => {
    const error = new AuthError();
    expect(error.message).toBe('Unauthorized');
  });

  it('has custom message', () => {
    const error = new AuthError('Invalid token');
    expect(error.message).toBe('Invalid token');
  });

  it('has statusCode 401', () => {
    const error = new AuthError();
    expect(error.statusCode).toBe(401);
  });

  it('has code AUTH_ERROR', () => {
    const error = new AuthError();
    expect(error.code).toBe('AUTH_ERROR');
  });

  it('is operational', () => {
    const error = new AuthError();
    expect(error.isOperational).toBe(true);
  });

  it('extends AppError', () => {
    const error = new AuthError();
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('ForbiddenError', () => {
  it('has default message', () => {
    const error = new ForbiddenError();
    expect(error.message).toBe('Forbidden');
  });

  it('has custom message', () => {
    const error = new ForbiddenError('Admin only');
    expect(error.message).toBe('Admin only');
  });

  it('has statusCode 403', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
  });

  it('has code FORBIDDEN', () => {
    const error = new ForbiddenError();
    expect(error.code).toBe('FORBIDDEN');
  });

  it('is operational', () => {
    const error = new ForbiddenError();
    expect(error.isOperational).toBe(true);
  });

  it('extends AppError', () => {
    const error = new ForbiddenError();
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('NotFoundError', () => {
  it('has default message', () => {
    const error = new NotFoundError();
    expect(error.message).toBe('Resource not found');
  });

  it('has custom message', () => {
    const error = new NotFoundError('User not found');
    expect(error.message).toBe('User not found');
  });

  it('has statusCode 404', () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
  });

  it('has code NOT_FOUND', () => {
    const error = new NotFoundError();
    expect(error.code).toBe('NOT_FOUND');
  });

  it('is operational', () => {
    const error = new NotFoundError();
    expect(error.isOperational).toBe(true);
  });

  it('extends AppError', () => {
    const error = new NotFoundError();
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('ConflictError', () => {
  it('has default message', () => {
    const error = new ConflictError();
    expect(error.message).toBe('Resource conflict');
  });

  it('has custom message', () => {
    const error = new ConflictError('Email already exists');
    expect(error.message).toBe('Email already exists');
  });

  it('has statusCode 409', () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
  });

  it('has code CONFLICT', () => {
    const error = new ConflictError();
    expect(error.code).toBe('CONFLICT');
  });

  it('is operational', () => {
    const error = new ConflictError();
    expect(error.isOperational).toBe(true);
  });

  it('extends AppError', () => {
    const error = new ConflictError();
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('PaymentError', () => {
  it('has default message', () => {
    const error = new PaymentError();
    expect(error.message).toBe('Payment failed');
  });

  it('has custom message', () => {
    const error = new PaymentError('Card declined');
    expect(error.message).toBe('Card declined');
  });

  it('has statusCode 402', () => {
    const error = new PaymentError();
    expect(error.statusCode).toBe(402);
  });

  it('has code PAYMENT_ERROR', () => {
    const error = new PaymentError();
    expect(error.code).toBe('PAYMENT_ERROR');
  });

  it('is operational', () => {
    const error = new PaymentError();
    expect(error.isOperational).toBe(true);
  });

  it('extends AppError', () => {
    const error = new PaymentError();
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('RateLimitError', () => {
  it('has default message', () => {
    const error = new RateLimitError();
    expect(error.message).toBe('Too many requests');
  });

  it('has custom message', () => {
    const error = new RateLimitError('Slow down');
    expect(error.message).toBe('Slow down');
  });

  it('has statusCode 429', () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
  });

  it('has code RATE_LIMIT_EXCEEDED', () => {
    const error = new RateLimitError();
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('is operational', () => {
    const error = new RateLimitError();
    expect(error.isOperational).toBe(true);
  });

  it('extends AppError', () => {
    const error = new RateLimitError();
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('DatabaseError', () => {
  it('has default message', () => {
    const error = new DatabaseError();
    expect(error.message).toBe('Database operation failed');
  });

  it('has custom message', () => {
    const error = new DatabaseError('Connection timeout');
    expect(error.message).toBe('Connection timeout');
  });

  it('has statusCode 500', () => {
    const error = new DatabaseError();
    expect(error.statusCode).toBe(500);
  });

  it('has code DATABASE_ERROR', () => {
    const error = new DatabaseError();
    expect(error.code).toBe('DATABASE_ERROR');
  });

  it('is NOT operational', () => {
    const error = new DatabaseError();
    expect(error.isOperational).toBe(false);
  });

  it('extends AppError', () => {
    const error = new DatabaseError();
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('ExternalServiceError', () => {
  it('has default message', () => {
    const error = new ExternalServiceError();
    expect(error.message).toBe('External service error');
  });

  it('has custom message', () => {
    const error = new ExternalServiceError('API down');
    expect(error.message).toBe('API down');
  });

  it('has default statusCode 502', () => {
    const error = new ExternalServiceError();
    expect(error.statusCode).toBe(502);
  });

  it('has custom statusCode', () => {
    const error = new ExternalServiceError('Timeout', 504);
    expect(error.statusCode).toBe(504);
  });

  it('has code EXTERNAL_SERVICE_ERROR', () => {
    const error = new ExternalServiceError();
    expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
  });

  it('is operational', () => {
    const error = new ExternalServiceError();
    expect(error.isOperational).toBe(true);
  });

  it('extends AppError', () => {
    const error = new ExternalServiceError();
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('handleApiError', () => {
  it('handles ValidationError', () => {
    const error = new ValidationError('Invalid input');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Invalid input', statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  it('handles AuthError', () => {
    const error = new AuthError('No token');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'No token', statusCode: 401, code: 'AUTH_ERROR' });
  });

  it('handles ForbiddenError', () => {
    const error = new ForbiddenError('No access');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'No access', statusCode: 403, code: 'FORBIDDEN' });
  });

  it('handles NotFoundError', () => {
    const error = new NotFoundError('Not found');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Not found', statusCode: 404, code: 'NOT_FOUND' });
  });

  it('handles ConflictError', () => {
    const error = new ConflictError('Duplicate');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Duplicate', statusCode: 409, code: 'CONFLICT' });
  });

  it('handles PaymentError', () => {
    const error = new PaymentError('Failed');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Failed', statusCode: 402, code: 'PAYMENT_ERROR' });
  });

  it('handles RateLimitError', () => {
    const error = new RateLimitError('Slow');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Slow', statusCode: 429, code: 'RATE_LIMIT_EXCEEDED' });
  });

  it('handles DatabaseError', () => {
    const error = new DatabaseError('DB error');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'DB error', statusCode: 500, code: 'DATABASE_ERROR' });
  });

  it('handles ExternalServiceError', () => {
    const error = new ExternalServiceError('API down');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'API down', statusCode: 502, code: 'EXTERNAL_SERVICE_ERROR' });
  });

  it('handles Prisma P2002 unique constraint', () => {
    const error = { code: 'P2002' };
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Unique constraint violation', statusCode: 409, code: 'UNIQUE_CONSTRAINT' });
  });

  it('handles Prisma P2025 record not found', () => {
    const error = { code: 'P2025' };
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Record not found', statusCode: 404, code: 'RECORD_NOT_FOUND' });
  });

  it('handles Prisma P2034 transaction conflict', () => {
    const error = { code: 'P2034' };
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Transaction conflict', statusCode: 409, code: 'TRANSACTION_CONFLICT' });
  });

  it('handles unknown Prisma error', () => {
    const error = { code: 'P9999', meta: {} };
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Database error', statusCode: 500, code: 'DATABASE_ERROR' });
  });

  it('handles unknown error', () => {
    const error = new Error('Something broke');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles string error', () => {
    const result = handleApiError('error string');
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles null error', () => {
    const result = handleApiError(null);
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles undefined error', () => {
    const result = handleApiError(undefined);
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles number error', () => {
    const result = handleApiError(42);
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles object without code', () => {
    const result = handleApiError({ message: 'oops' });
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('returns message string', () => {
    const error = new ValidationError('test');
    const result = handleApiError(error);
    expect(typeof result.message).toBe('string');
  });

  it('returns statusCode number', () => {
    const error = new ValidationError('test');
    const result = handleApiError(error);
    expect(typeof result.statusCode).toBe('number');
  });

  it('returns code string for AppError', () => {
    const error = new ValidationError('test');
    const result = handleApiError(error);
    expect(typeof result.code).toBe('string');
  });
});
