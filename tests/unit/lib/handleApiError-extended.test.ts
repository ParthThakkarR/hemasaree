// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { handleApiError, AppError, ValidationError, AuthError, NotFoundError } from '@/lib/errors';

describe('handleApiError - Extended', () => {
  it('handles ValidationError with custom message', () => {
    const error = new ValidationError('Custom validation error');
    const result = handleApiError(error);
    expect(result.message).toBe('Custom validation error');
    expect(result.statusCode).toBe(400);
    expect(result.code).toBe('VALIDATION_ERROR');
  });

  it('handles AuthError with custom message', () => {
    const error = new AuthError('Token expired');
    const result = handleApiError(error);
    expect(result.message).toBe('Token expired');
    expect(result.statusCode).toBe(401);
    expect(result.code).toBe('AUTH_ERROR');
  });

  it('handles NotFoundError with custom message', () => {
    const error = new NotFoundError('Product not found');
    const result = handleApiError(error);
    expect(result.message).toBe('Product not found');
    expect(result.statusCode).toBe(404);
    expect(result.code).toBe('NOT_FOUND');
  });

  it('handles AppError with custom code', () => {
    const error = new AppError('Custom error', 500, true, 'CUSTOM_CODE');
    const result = handleApiError(error);
    expect(result.message).toBe('Custom error');
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe('CUSTOM_CODE');
  });

  it('handles AppError without code', () => {
    const error = new AppError('No code error', 500);
    const result = handleApiError(error);
    expect(result.message).toBe('No code error');
    expect(result.statusCode).toBe(500);
    expect(result.code).toBeUndefined();
  });

  it('handles AppError with isOperational false', () => {
    const error = new AppError('Non-operational', 500, false);
    const result = handleApiError(error);
    expect(result.message).toBe('Non-operational');
    expect(error.isOperational).toBe(false);
  });

  it('handles Prisma P2002 with meta', () => {
    const error = { code: 'P2002', meta: { target: ['email'] } };
    const result = handleApiError(error);
    expect(result.message).toBe('Unique constraint violation');
    expect(result.statusCode).toBe(409);
    expect(result.code).toBe('UNIQUE_CONSTRAINT');
  });

  it('handles Prisma P2025 with meta', () => {
    const error = { code: 'P2025', meta: { modelName: 'User' } };
    const result = handleApiError(error);
    expect(result.message).toBe('Record not found');
    expect(result.statusCode).toBe(404);
    expect(result.code).toBe('RECORD_NOT_FOUND');
  });

  it('handles Prisma P2034 with meta', () => {
    const error = { code: 'P2034', meta: {} };
    const result = handleApiError(error);
    expect(result.message).toBe('Transaction conflict');
    expect(result.statusCode).toBe(409);
    expect(result.code).toBe('TRANSACTION_CONFLICT');
  });

  it('handles unknown Prisma error code', () => {
    const error = { code: 'P9999', meta: {} };
    const result = handleApiError(error);
    expect(result.message).toBe('Database error');
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe('DATABASE_ERROR');
  });

  it('handles Prisma error without meta', () => {
    const error = { code: 'P2002' };
    const result = handleApiError(error);
    expect(result.statusCode).toBe(409);
  });

  it('handles generic Error', () => {
    const error = new Error('Something went wrong');
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe('INTERNAL_ERROR');
  });

  it('handles string error', () => {
    const result = handleApiError('error string');
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles null error', () => {
    const result = handleApiError(null);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles undefined error', () => {
    const result = handleApiError(undefined);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles object without code', () => {
    const result = handleApiError({ message: 'test' });
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles empty object', () => {
    const result = handleApiError({});
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles symbol error', () => {
    const result = handleApiError(Symbol('test'));
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles boolean error', () => {
    const result = handleApiError(true);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles number error', () => {
    const result = handleApiError(42);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles array error', () => {
    const result = handleApiError([1, 2, 3]);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles function error', () => {
    const result = handleApiError(() => {});
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles Date error', () => {
    const result = handleApiError(new Date());
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles RegExp error', () => {
    const result = handleApiError(/test/);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles Map error', () => {
    const result = handleApiError(new Map());
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles Set error', () => {
    const result = handleApiError(new Set());
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles Promise error', () => {
    const result = handleApiError(Promise.resolve());
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles nested error object', () => {
    const error = { code: 'P2002', meta: { nested: { key: 'value' } } };
    const result = handleApiError(error);
    expect(result.statusCode).toBe(409);
  });

  it('handles Prisma error with empty meta', () => {
    const error = { code: 'P2002', meta: {} };
    const result = handleApiError(error);
    expect(result.statusCode).toBe(409);
  });

  it('handles Prisma error with null meta', () => {
    const error = { code: 'P2002', meta: null };
    const result = handleApiError(error);
    expect(result.statusCode).toBe(409);
  });

  it('handles object with code but not Prisma code', () => {
    const error = { code: 'CUSTOM_ERROR' };
    const result = handleApiError(error);
    expect(result.message).toBe('Database error');
    expect(result.statusCode).toBe(500);
  });

  it('handles object with unknown Prisma-like code', () => {
    const error = { code: 'P0000' };
    const result = handleApiError(error);
    expect(result.message).toBe('Database error');
    expect(result.statusCode).toBe(500);
  });

  it('handles error with custom properties', () => {
    const error = new Error('Custom');
    (error as any).customProp = 'value';
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
  });

  it('handles error with stack trace', () => {
    const error = new Error('Stack test');
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
  });

  it('handles error with name property', () => {
    const error = new TypeError('Type error');
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
  });

  it('handles error with cause', () => {
    const cause = new Error('Cause');
    const error = new Error('Main', { cause });
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
  });

  it('handles AppError extended class', () => {
    class CustomError extends AppError {
      constructor(message: string) {
        super(message, 418, true, 'TEAPOT');
      }
    }
    const error = new CustomError("I'm a teapot");
    const result = handleApiError(error);
    expect(result.message).toBe("I'm a teapot");
    expect(result.statusCode).toBe(418);
    expect(result.code).toBe('TEAPOT');
  });

  it('handles error with circular reference', () => {
    const error: any = { message: 'Circular' };
    error.self = error;
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
  });

  it('handles error with toJSON method', () => {
    const error = { message: 'JSON', toJSON: () => ({ serialized: true }) };
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
  });

  it('handles error with valueOf method', () => {
    const error = { message: 'Value', valueOf: () => 42 };
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
  });

  it('handles error with toString method', () => {
    const error = { message: 'String', toString: () => 'Custom string' };
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
  });

  it('handles buffer error', () => {
    const result = handleApiError(Buffer.from('test'));
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles ArrayBuffer error', () => {
    const result = handleApiError(new ArrayBuffer(8));
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles TypedArray error', () => {
    const result = handleApiError(new Uint8Array([1, 2, 3]));
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles WeakMap error', () => {
    const result = handleApiError(new WeakMap());
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles WeakSet error', () => {
    const result = handleApiError(new WeakSet());
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles Proxy error', () => {
    const target = {};
    const proxy = new Proxy(target, {});
    const result = handleApiError(proxy);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles Iterator error', () => {
    const iter = { next: () => ({ done: true, value: undefined }) };
    const result = handleApiError(iter);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles Generator error', () => {
    function* gen() { yield 1; }
    const result = handleApiError(gen());
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles AsyncFunction error', () => {
    const asyncFn = async () => {};
    const result = handleApiError(asyncFn);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles Class error', () => {
    class MyClass {}
    const result = handleApiError(MyClass);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles Instance error', () => {
    class MyClass {}
    const result = handleApiError(new MyClass());
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles null prototype object', () => {
    const obj = Object.create(null);
    obj.message = 'No prototype';
    const result = handleApiError(obj);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles frozen object', () => {
    const obj = Object.freeze({ message: 'Frozen' });
    const result = handleApiError(obj);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles sealed object', () => {
    const obj = Object.seal({ message: 'Sealed' });
    const result = handleApiError(obj);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });

  it('handles non-extensible object', () => {
    const obj = {};
    Object.preventExtensions(obj);
    const result = handleApiError(obj);
    expect(result.message).toBe('Internal server error');
    expect(result.statusCode).toBe(500);
  });
});
