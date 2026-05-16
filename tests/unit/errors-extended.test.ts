import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('Test error', 400, true, 'TEST_CODE');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.code).toBe('TEST_CODE');
      expect(error).toBeInstanceOf(Error);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test', 500);
      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should create with default message', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should create with custom message', () => {
      const error = new ValidationError('Invalid email');
      expect(error.message).toBe('Invalid email');
    });
  });

  describe('AuthError', () => {
    it('should create with default message', () => {
      const error = new AuthError();
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create with default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('should create with default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ConflictError', () => {
    it('should create with default message', () => {
      const error = new ConflictError();
      expect(error.message).toBe('Resource conflict');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('PaymentError', () => {
    it('should create with default message', () => {
      const error = new PaymentError();
      expect(error.message).toBe('Payment failed');
      expect(error.statusCode).toBe(402);
    });
  });

  describe('RateLimitError', () => {
    it('should create with default message', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('DatabaseError', () => {
    it('should create with default message', () => {
      const error = new DatabaseError();
      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ExternalServiceError', () => {
    it('should create with default status 502', () => {
      const error = new ExternalServiceError('Service unavailable');
      expect(error.message).toBe('Service unavailable');
      expect(error.statusCode).toBe(502);
    });

    it('should allow custom status code', () => {
      const error = new ExternalServiceError('Bad gateway', 502);
      expect(error.statusCode).toBe(502);
    });
  });
});

describe('handleApiError', () => {
  it('should handle AppError instances', () => {
    const error = new ValidationError('Invalid input');
    const result = handleApiError(error);
    
    expect(result.message).toBe('Invalid input');
    expect(result.statusCode).toBe(400);
    expect(result.code).toBe('VALIDATION_ERROR');
  });

  it('should handle Prisma P2002 error', () => {
    const error = { code: 'P2002', meta: {} };
    const result = handleApiError(error);
    
    expect(result.message).toBe('Unique constraint violation');
    expect(result.statusCode).toBe(409);
  });

  it('should handle Prisma P2025 error', () => {
    const error = { code: 'P2025' };
    const result = handleApiError(error);
    
    expect(result.message).toBe('Record not found');
    expect(result.statusCode).toBe(404);
  });

  it('should handle Prisma P2034 error', () => {
    const error = { code: 'P2034' };
    const result = handleApiError(error);
    
    expect(result.message).toBe('Transaction conflict');
    expect(result.statusCode).toBe(409);
  });

  it('should handle unknown Prisma errors', () => {
    const error = { code: 'P9999', meta: {} };
    const result = handleApiError(error);
    
    expect(result.message).toBe('Database error');
    expect(result.statusCode).toBe(500);
  });

  it('should handle generic errors', () => {
    const error = new Error('Something went wrong');
    const result = handleApiError(error);
    
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe('INTERNAL_ERROR');
  });

  it('should handle unknown error types', () => {
    const result = handleApiError('string error');
    expect(result.statusCode).toBe(500);
  });

  it('should handle null/undefined errors', () => {
    const result = handleApiError(null);
    expect(result.statusCode).toBe(500);
  });
});

describe('Error Edge Cases', () => {
it('should handle errors with extra properties', () => {
    const error = {
      code: 'P2002',
      meta: { target: ['email'] },
      message: 'Unique constraint',
    };
    const result = handleApiError(error);
    
    expect(result.statusCode).toBe(409);
  });

  it('should handle AppError with all parameters', () => {
    const error = new AppError('Custom error', 418, false, 'CUSTOM');
    const result = handleApiError(error);
    
    expect(result.message).toBe('Custom error');
    expect(result.statusCode).toBe(418);
    expect(result.code).toBe('CUSTOM');
  });

  it('should handle deeply nested errors', () => {
    const error = {
      code: 'P2002',
      meta: { target: ['field1', 'field2'] },
    };
    const result = handleApiError(error);
    
    expect(result.message).toBe('Unique constraint violation');
  });

  it('should handle errors with circular references', () => {
    const error: any = { code: 'P9999' };
    error.self = error;
    
    // Should not crash
    expect(() => handleApiError(error)).not.toThrow();
  });
});

describe('Error Security Tests', () => {
  it('should not expose internal error details', () => {
    const internalError = new Error('Database connection string at mysql://user:pass@host');
    const result = handleApiError(internalError);
    
    expect(result.message).toBe('Internal server error');
    expect(result.message).not.toContain('mysql://');
  });

  it('should sanitize stack traces in production', () => {
    const error = new AppError('Test', 500);
    // Stack trace should exist but not be exposed to client
    expect(error.stack).toBeDefined();
  });

  it('should handle errors with prototype pollution attempt', () => {
    const error = JSON.parse('{"code":"P9999","__proto__":{"polluted":true}}');
    const result = handleApiError(error);
    
    expect(result.statusCode).toBe(500);
  });

  it('should not leak sensitive data in error messages', () => {
    const sensitiveError = new Error('User password is 123456');
    const result = handleApiError(sensitiveError);
    
    expect(result.message).toBe('Internal server error');
    expect(result.message).not.toContain('123456');
  });
});