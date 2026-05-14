import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, AuthError, PaymentError, NotFoundError, DatabaseError } from '../../lib/errors';

describe('Custom Error Classes', () => {
  describe('AppError', () => {
    it('should create error with correct message and status code', () => {
      const err = new AppError('Something went wrong', 500);
      expect(err.message).toBe('Something went wrong');
      expect(err.statusCode).toBe(500);
      expect(err.isOperational).toBe(true);
    });

    it('should default isOperational to true', () => {
      const err = new AppError('test', 400);
      expect(err.isOperational).toBe(true);
    });

    it('should allow non-operational errors', () => {
      const err = new AppError('fatal', 500, false);
      expect(err.isOperational).toBe(false);
    });

    it('should be an instance of Error', () => {
      const err = new AppError('test', 400);
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(AppError);
    });

    it('should have a stack trace', () => {
      const err = new AppError('test', 400);
      expect(err.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should have status code 400', () => {
      const err = new ValidationError();
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Validation failed');
    });

    it('should accept custom message', () => {
      const err = new ValidationError('Invalid email format');
      expect(err.message).toBe('Invalid email format');
      expect(err.statusCode).toBe(400);
    });

    it('should be operational', () => {
      expect(new ValidationError().isOperational).toBe(true);
    });
  });

  describe('AuthError', () => {
    it('should have status code 401', () => {
      const err = new AuthError();
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const err = new AuthError('Token expired');
      expect(err.message).toBe('Token expired');
    });
  });

  describe('PaymentError', () => {
    it('should have status code 402', () => {
      const err = new PaymentError();
      expect(err.statusCode).toBe(402);
      expect(err.message).toBe('Payment failed');
    });

    it('should accept custom message', () => {
      const err = new PaymentError('Insufficient funds');
      expect(err.message).toBe('Insufficient funds');
    });
  });

  describe('NotFoundError', () => {
    it('should have status code 404', () => {
      const err = new NotFoundError();
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Resource not found');
    });

    it('should accept custom message', () => {
      const err = new NotFoundError('Product not found');
      expect(err.message).toBe('Product not found');
    });
  });

  describe('DatabaseError', () => {
    it('should have status code 500', () => {
      const err = new DatabaseError();
      expect(err.statusCode).toBe(500);
      expect(err.message).toBe('Database operation failed');
    });

    it('should NOT be operational (system error)', () => {
      const err = new DatabaseError();
      expect(err.isOperational).toBe(false);
    });
  });

  describe('Error hierarchy', () => {
    it('all custom errors should be instances of AppError', () => {
      expect(new ValidationError()).toBeInstanceOf(AppError);
      expect(new AuthError()).toBeInstanceOf(AppError);
      expect(new PaymentError()).toBeInstanceOf(AppError);
      expect(new NotFoundError()).toBeInstanceOf(AppError);
      expect(new DatabaseError()).toBeInstanceOf(AppError);
    });

    it('all custom errors should be instances of Error', () => {
      expect(new ValidationError()).toBeInstanceOf(Error);
      expect(new AuthError()).toBeInstanceOf(Error);
      expect(new NotFoundError()).toBeInstanceOf(Error);
    });
  });
});
