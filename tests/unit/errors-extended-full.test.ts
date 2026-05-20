// @ts-nocheck
import { describe, it, expect } from 'vitest';
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
    const error = new AppError('Test error', 400);
    expect(error.statusCode).toBe(400);
  });

  it('sets isOperational to true by default', () => {
    const error = new AppError('Test error', 500);
    expect(error.isOperational).toBe(true);
  });

  it('sets isOperational to false when specified', () => {
    const error = new AppError('Test error', 500, false);
    expect(error.isOperational).toBe(false);
  });

  it('sets code when provided', () => {
    const error = new AppError('Test error', 500, true, 'CUSTOM_CODE');
    expect(error.code).toBe('CUSTOM_CODE');
  });

  it('has undefined code when not provided', () => {
    const error = new AppError('Test error', 500);
    expect(error.code).toBeUndefined();
  });

  it('extends Error', () => {
    const error = new AppError('Test error', 500);
    expect(error).toBeInstanceOf(Error);
  });

  it('has correct name', () => {
    const error = new AppError('Test error', 500);
    expect(error.name).toBe('Error');
  });

  it('has stack trace', () => {
    const error = new AppError('Test error', 500);
    expect(error.stack).toBeDefined();
  });

  it('handles empty message', () => {
    const error = new AppError('', 500);
    expect(error.message).toBe('');
  });

  it('handles unicode message', () => {
    const error = new AppError('त्रुटि', 500);
    expect(error.message).toBe('त्रुटि');
  });

  it('handles long message', () => {
    const longMsg = 'A'.repeat(1000);
    const error = new AppError(longMsg, 500);
    expect(error.message).toBe(longMsg);
  });

  it('handles status code 100', () => {
    const error = new AppError('Test', 100);
    expect(error.statusCode).toBe(100);
  });

  it('handles status code 599', () => {
    const error = new AppError('Test', 599);
    expect(error.statusCode).toBe(599);
  });

  it('handles status code 0', () => {
    const error = new AppError('Test', 0);
    expect(error.statusCode).toBe(0);
  });

  it('handles negative status code', () => {
    const error = new AppError('Test', -1);
    expect(error.statusCode).toBe(-1);
  });
});

describe('ValidationError', () => {
  it('has default message', () => {
    const error = new ValidationError();
    expect(error.message).toBe('Validation failed');
  });

  it('has custom message', () => {
    const error = new ValidationError('Custom validation error');
    expect(error.message).toBe('Custom validation error');
  });

  it('has status 400', () => {
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
});

describe('AuthError', () => {
  it('has default message', () => {
    const error = new AuthError();
    expect(error.message).toBe('Unauthorized');
  });

  it('has custom message', () => {
    const error = new AuthError('Token expired');
    expect(error.message).toBe('Token expired');
  });

  it('has status 401', () => {
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
    const error = new ForbiddenError('Admin access required');
    expect(error.message).toBe('Admin access required');
  });

  it('has status 403', () => {
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
    const error = new NotFoundError('Product not found');
    expect(error.message).toBe('Product not found');
  });

  it('has status 404', () => {
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

  it('has status 409', () => {
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
    const error = new PaymentError('Insufficient funds');
    expect(error.message).toBe('Insufficient funds');
  });

  it('has status 402', () => {
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
    const error = new RateLimitError('Rate limit exceeded for IP');
    expect(error.message).toBe('Rate limit exceeded for IP');
  });

  it('has status 429', () => {
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

  it('has status 500', () => {
    const error = new DatabaseError();
    expect(error.statusCode).toBe(500);
  });

  it('has code DATABASE_ERROR', () => {
    const error = new DatabaseError();
    expect(error.code).toBe('DATABASE_ERROR');
  });

  it('is not operational', () => {
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
    const error = new ExternalServiceError('Payment gateway down');
    expect(error.message).toBe('Payment gateway down');
  });

  it('has default status 502', () => {
    const error = new ExternalServiceError();
    expect(error.statusCode).toBe(502);
  });

  it('has custom status', () => {
    const error = new ExternalServiceError('Service unavailable', 503);
    expect(error.statusCode).toBe(503);
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
  it('handles AppError', () => {
    const error = new ValidationError('Invalid input');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Invalid input', statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  it('handles AuthError', () => {
    const error = new AuthError('Token expired');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Token expired', statusCode: 401, code: 'AUTH_ERROR' });
  });

  it('handles NotFoundError', () => {
    const error = new NotFoundError('Product not found');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Product not found', statusCode: 404, code: 'NOT_FOUND' });
  });

  it('handles ConflictError', () => {
    const error = new ConflictError('Email exists');
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Email exists', statusCode: 409, code: 'CONFLICT' });
  });

  it('handles Prisma P2002 error', () => {
    const error = { code: 'P2002', meta: {} };
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Unique constraint violation', statusCode: 409, code: 'UNIQUE_CONSTRAINT' });
  });

  it('handles Prisma P2025 error', () => {
    const error = { code: 'P2025', meta: {} };
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Record not found', statusCode: 404, code: 'RECORD_NOT_FOUND' });
  });

  it('handles Prisma P2034 error', () => {
    const error = { code: 'P2034', meta: {} };
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Transaction conflict', statusCode: 409, code: 'TRANSACTION_CONFLICT' });
  });

  it('handles unknown Prisma error', () => {
    const error = { code: 'P9999', meta: {} };
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Database error', statusCode: 500, code: 'DATABASE_ERROR' });
  });

  it('handles generic Error', () => {
    const error = new Error('Something went wrong');
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

  it('handles object without code', () => {
    const result = handleApiError({ message: 'test' });
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles Prisma error with meta', () => {
    const error = { code: 'P2002', meta: { target: ['email'] } };
    const result = handleApiError(error);
    expect(result.statusCode).toBe(409);
  });

  it('handles RateLimitError', () => {
    const error = new RateLimitError();
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Too many requests', statusCode: 429, code: 'RATE_LIMIT_EXCEEDED' });
  });

  it('handles PaymentError', () => {
    const error = new PaymentError();
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Payment failed', statusCode: 402, code: 'PAYMENT_ERROR' });
  });

  it('handles ForbiddenError', () => {
    const error = new ForbiddenError();
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Forbidden', statusCode: 403, code: 'FORBIDDEN' });
  });

  it('handles DatabaseError', () => {
    const error = new DatabaseError();
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'Database operation failed', statusCode: 500, code: 'DATABASE_ERROR' });
  });

  it('handles ExternalServiceError', () => {
    const error = new ExternalServiceError();
    const result = handleApiError(error);
    expect(result).toEqual({ message: 'External service error', statusCode: 502, code: 'EXTERNAL_SERVICE_ERROR' });
  });

  it('handles Error with custom message', () => {
    const error = new Error('Custom error message');
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
  });

  it('handles nested error object', () => {
    const error = { code: 'P2002', meta: { nested: { key: 'value' } } };
    const result = handleApiError(error);
    expect(result.statusCode).toBe(409);
  });

  it('handles Prisma error without meta', () => {
    const error = { code: 'P2002' };
    const result = handleApiError(error);
    expect(result.statusCode).toBe(409);
  });

  it('handles symbol error', () => {
    const result = handleApiError(Symbol('test'));
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles boolean error', () => {
    const result = handleApiError(true);
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles number error', () => {
    const result = handleApiError(42);
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles array error', () => {
    const result = handleApiError([1, 2, 3]);
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles function error', () => {
    const result = handleApiError(() => {});
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles empty object error', () => {
    const result = handleApiError({});
    expect(result).toEqual({ message: 'Internal server error', statusCode: 500, code: 'INTERNAL_ERROR' });
  });

  it('handles AppError without code', () => {
    const error = new AppError('No code error', 500);
    const result = handleApiError(error);
    expect(result.code).toBeUndefined();
  });
});
