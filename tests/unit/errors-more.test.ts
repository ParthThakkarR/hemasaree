// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  PaymentError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  handleApiError,
} from '@/lib/errors';

describe('AppError Extended', () => {
  it('should have correct prototype chain', () => {
    const err = new AppError('test', 500);
    expect(err.constructor.name).toBe('AppError');
  });

  it('should preserve stack trace', () => {
    const err = new AppError('test', 500);
    expect(err.stack).toBeDefined();
    expect(typeof err.stack).toBe('string');
  });

  it('should accept custom code', () => {
    const err = new AppError('test', 500, true, 'CUSTOM_CODE');
    expect(err.code).toBe('CUSTOM_CODE');
  });

  it('should have undefined code by default', () => {
    const err = new AppError('test', 500);
    expect(err.code).toBeUndefined();
  });

  it('should work with status code 100', () => {
    const err = new AppError('test', 100);
    expect(err.statusCode).toBe(100);
  });

  it('should work with status code 599', () => {
    const err = new AppError('test', 599);
    expect(err.statusCode).toBe(599);
  });

  it('should work with status code 0', () => {
    const err = new AppError('test', 0);
    expect(err.statusCode).toBe(0);
  });

  it('should work with negative status code', () => {
    const err = new AppError('test', -1);
    expect(err.statusCode).toBe(-1);
  });

  it('should handle empty message', () => {
    const err = new AppError('', 500);
    expect(err.message).toBe('');
  });

  it('should handle very long message', () => {
    const longMsg = 'a'.repeat(10000);
    const err = new AppError(longMsg, 500);
    expect(err.message).toBe(longMsg);
  });

  it('should handle unicode message', () => {
    const err = new AppError('त्रुटि', 500);
    expect(err.message).toBe('त्रुटि');
  });

  it('should handle newline in message', () => {
    const err = new AppError('line1\nline2', 500);
    expect(err.message).toContain('\n');
  });

  it('should be throwable', () => {
    expect(() => { throw new AppError('thrown', 500); }).toThrow(AppError);
  });

  it('should be catchable', () => {
    try {
      throw new AppError('caught', 500);
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect(e.message).toBe('caught');
    }
  });

  it('should work with Object.setPrototypeOf', () => {
    const err = new AppError('test', 500);
    expect(Object.getPrototypeOf(err)).toBe(AppError.prototype);
  });

  it('should have name property', () => {
    const err = new AppError('test', 500);
    expect(err.name).toBe('Error');
  });

  it('should handle non-operational flag false', () => {
    const err = new AppError('test', 500, false);
    expect(err.isOperational).toBe(false);
  });

  it('should handle non-operational flag true', () => {
    const err = new AppError('test', 500, true);
    expect(err.isOperational).toBe(true);
  });
});

describe('ForbiddenError', () => {
  it('should have status code 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
  });

  it('should have default message', () => {
    const err = new ForbiddenError();
    expect(err.message).toBe('Forbidden');
  });

  it('should accept custom message', () => {
    const err = new ForbiddenError('Access denied');
    expect(err.message).toBe('Access denied');
  });

  it('should be operational', () => {
    expect(new ForbiddenError().isOperational).toBe(true);
  });

  it('should have correct code', () => {
    expect(new ForbiddenError().code).toBe('FORBIDDEN');
  });

  it('should be instance of AppError', () => {
    expect(new ForbiddenError()).toBeInstanceOf(AppError);
  });

  it('should be instance of Error', () => {
    expect(new ForbiddenError()).toBeInstanceOf(Error);
  });
});

describe('ConflictError', () => {
  it('should have status code 409', () => {
    const err = new ConflictError();
    expect(err.statusCode).toBe(409);
  });

  it('should have default message', () => {
    const err = new ConflictError();
    expect(err.message).toBe('Resource conflict');
  });

  it('should accept custom message', () => {
    const err = new ConflictError('Email already exists');
    expect(err.message).toBe('Email already exists');
  });

  it('should be operational', () => {
    expect(new ConflictError().isOperational).toBe(true);
  });

  it('should have correct code', () => {
    expect(new ConflictError().code).toBe('CONFLICT');
  });

  it('should be instance of AppError', () => {
    expect(new ConflictError()).toBeInstanceOf(AppError);
  });
});

describe('RateLimitError', () => {
  it('should have status code 429', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
  });

  it('should have default message', () => {
    const err = new RateLimitError();
    expect(err.message).toBe('Too many requests');
  });

  it('should accept custom message', () => {
    const err = new RateLimitError('Rate limit exceeded for IP');
    expect(err.message).toBe('Rate limit exceeded for IP');
  });

  it('should be operational', () => {
    expect(new RateLimitError().isOperational).toBe(true);
  });

  it('should have correct code', () => {
    expect(new RateLimitError().code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should be instance of AppError', () => {
    expect(new RateLimitError()).toBeInstanceOf(AppError);
  });
});

describe('ExternalServiceError', () => {
  it('should have default status code 502', () => {
    const err = new ExternalServiceError();
    expect(err.statusCode).toBe(502);
  });

  it('should have default message', () => {
    const err = new ExternalServiceError();
    expect(err.message).toBe('External service error');
  });

  it('should accept custom message', () => {
    const err = new ExternalServiceError('Payment gateway down');
    expect(err.message).toBe('Payment gateway down');
  });

  it('should accept custom status code', () => {
    const err = new ExternalServiceError('Service unavailable', 503);
    expect(err.statusCode).toBe(503);
  });

  it('should be operational', () => {
    expect(new ExternalServiceError().isOperational).toBe(true);
  });

  it('should have correct code', () => {
    expect(new ExternalServiceError().code).toBe('EXTERNAL_SERVICE_ERROR');
  });

  it('should be instance of AppError', () => {
    expect(new ExternalServiceError()).toBeInstanceOf(AppError);
  });

  it('should work with status 500', () => {
    const err = new ExternalServiceError('test', 500);
    expect(err.statusCode).toBe(500);
  });

  it('should work with status 504', () => {
    const err = new ExternalServiceError('Gateway timeout', 504);
    expect(err.statusCode).toBe(504);
  });
});

describe('handleApiError Extended', () => {
  it('handles AppError instances', () => {
    const err = new ValidationError('Invalid input');
    const result = handleApiError(err);
    expect(result).toEqual({ message: 'Invalid input', statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  it('handles AuthError', () => {
    const err = new AuthError('Token expired');
    const result = handleApiError(err);
    expect(result.statusCode).toBe(401);
  });

  it('handles NotFoundError', () => {
    const err = new NotFoundError('User not found');
    const result = handleApiError(err);
    expect(result.statusCode).toBe(404);
  });

  it('handles Prisma P2002 unique constraint', () => {
    const err = { code: 'P2002', meta: { target: ['email'] } };
    const result = handleApiError(err);
    expect(result.statusCode).toBe(409);
    expect(result.code).toBe('UNIQUE_CONSTRAINT');
  });

  it('handles Prisma P2025 record not found', () => {
    const err = { code: 'P2025' };
    const result = handleApiError(err);
    expect(result.statusCode).toBe(404);
    expect(result.code).toBe('RECORD_NOT_FOUND');
  });

  it('handles Prisma P2034 transaction conflict', () => {
    const err = { code: 'P2034' };
    const result = handleApiError(err);
    expect(result.statusCode).toBe(409);
    expect(result.code).toBe('TRANSACTION_CONFLICT');
  });

  it('handles unknown Prisma error code', () => {
    const err = { code: 'P9999', meta: {} };
    const result = handleApiError(err);
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe('DATABASE_ERROR');
  });

  it('handles Prisma error without meta', () => {
    const err = { code: 'P2002' };
    const result = handleApiError(err);
    expect(result.statusCode).toBe(409);
  });

  it('handles plain Error', () => {
    const err = new Error('Something broke');
    const result = handleApiError(err);
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe('INTERNAL_ERROR');
  });

  it('handles string error', () => {
    const result = handleApiError('string error');
    expect(result.statusCode).toBe(500);
  });

  it('handles null error', () => {
    const result = handleApiError(null);
    expect(result.statusCode).toBe(500);
  });

  it('handles undefined error', () => {
    const result = handleApiError(undefined);
    expect(result.statusCode).toBe(500);
  });

  it('handles number error', () => {
    const result = handleApiError(42);
    expect(result.statusCode).toBe(500);
  });

  it('handles object without code', () => {
    const result = handleApiError({ foo: 'bar' });
    expect(result.statusCode).toBe(500);
  });

  it('handles empty object', () => {
    const result = handleApiError({});
    expect(result.statusCode).toBe(500);
  });

  it('handles array error', () => {
    const result = handleApiError([1, 2, 3]);
    expect(result.statusCode).toBe(500);
  });

  it('handles boolean error', () => {
    const result = handleApiError(true);
    expect(result.statusCode).toBe(500);
  });

  it('returns correct shape for AppError', () => {
    const err = new ConflictError('Conflict');
    const result = handleApiError(err);
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('statusCode');
    expect(result).toHaveProperty('code');
  });

  it('handles PaymentError', () => {
    const err = new PaymentError('Card declined');
    const result = handleApiError(err);
    expect(result.statusCode).toBe(402);
  });

  it('handles DatabaseError', () => {
    const err = new DatabaseError('Connection lost');
    const result = handleApiError(err);
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe('DATABASE_ERROR');
  });

  it('handles ValidationError with custom message', () => {
    const err = new ValidationError('Email format invalid');
    const result = handleApiError(err);
    expect(result.message).toBe('Email format invalid');
  });

  it('handles RateLimitError', () => {
    const err = new RateLimitError();
    const result = handleApiError(err);
    expect(result.statusCode).toBe(429);
  });

  it('handles ForbiddenError', () => {
    const err = new ForbiddenError();
    const result = handleApiError(err);
    expect(result.statusCode).toBe(403);
  });

  it('handles ExternalServiceError', () => {
    const err = new ExternalServiceError();
    const result = handleApiError(err);
    expect(result.statusCode).toBe(502);
  });

  it('handles Error subclass', () => {
    class CustomError extends Error {
      code = 'CUSTOM';
    }
    const err = new CustomError();
    const result = handleApiError(err);
    expect(result.statusCode).toBe(500);
  });

  it('handles object with code but not Prisma code', () => {
    const err = { code: 'SOME_OTHER_CODE' };
    const result = handleApiError(err);
    expect(result.statusCode).toBe(500);
  });
});

describe('Error Code Constants', () => {
  it('ValidationError code is VALIDATION_ERROR', () => {
    expect(new ValidationError().code).toBe('VALIDATION_ERROR');
  });

  it('AuthError code is AUTH_ERROR', () => {
    expect(new AuthError().code).toBe('AUTH_ERROR');
  });

  it('NotFoundError code is NOT_FOUND', () => {
    expect(new NotFoundError().code).toBe('NOT_FOUND');
  });

  it('ConflictError code is CONFLICT', () => {
    expect(new ConflictError().code).toBe('CONFLICT');
  });

  it('PaymentError code is PAYMENT_ERROR', () => {
    expect(new PaymentError().code).toBe('PAYMENT_ERROR');
  });

  it('RateLimitError code is RATE_LIMIT_EXCEEDED', () => {
    expect(new RateLimitError().code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('DatabaseError code is DATABASE_ERROR', () => {
    expect(new DatabaseError().code).toBe('DATABASE_ERROR');
  });

  it('ExternalServiceError code is EXTERNAL_SERVICE_ERROR', () => {
    expect(new ExternalServiceError().code).toBe('EXTERNAL_SERVICE_ERROR');
  });

  it('ForbiddenError code is FORBIDDEN', () => {
    expect(new ForbiddenError().code).toBe('FORBIDDEN');
  });
});

describe('Error Status Codes', () => {
  it('ValidationError is 400', () => {
    expect(new ValidationError().statusCode).toBe(400);
  });

  it('AuthError is 401', () => {
    expect(new AuthError().statusCode).toBe(401);
  });

  it('PaymentError is 402', () => {
    expect(new PaymentError().statusCode).toBe(402);
  });

  it('ForbiddenError is 403', () => {
    expect(new ForbiddenError().statusCode).toBe(403);
  });

  it('NotFoundError is 404', () => {
    expect(new NotFoundError().statusCode).toBe(404);
  });

  it('ConflictError is 409', () => {
    expect(new ConflictError().statusCode).toBe(409);
  });

  it('RateLimitError is 429', () => {
    expect(new RateLimitError().statusCode).toBe(429);
  });

  it('DatabaseError is 500', () => {
    expect(new DatabaseError().statusCode).toBe(500);
  });

  it('ExternalServiceError default is 502', () => {
    expect(new ExternalServiceError().statusCode).toBe(502);
  });
});

describe('Error Operational Flags', () => {
  it('ValidationError is operational', () => {
    expect(new ValidationError().isOperational).toBe(true);
  });

  it('AuthError is operational', () => {
    expect(new AuthError().isOperational).toBe(true);
  });

  it('ForbiddenError is operational', () => {
    expect(new ForbiddenError().isOperational).toBe(true);
  });

  it('NotFoundError is operational', () => {
    expect(new NotFoundError().isOperational).toBe(true);
  });

  it('ConflictError is operational', () => {
    expect(new ConflictError().isOperational).toBe(true);
  });

  it('PaymentError is operational', () => {
    expect(new PaymentError().isOperational).toBe(true);
  });

  it('RateLimitError is operational', () => {
    expect(new RateLimitError().isOperational).toBe(true);
  });

  it('DatabaseError is NOT operational', () => {
    expect(new DatabaseError().isOperational).toBe(false);
  });

  it('ExternalServiceError is operational', () => {
    expect(new ExternalServiceError().isOperational).toBe(true);
  });
});
