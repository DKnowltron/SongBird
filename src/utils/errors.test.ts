import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from './errors.js';

describe('error classes', () => {
  it('NotFoundError should have 404 status and code', () => {
    const err = new NotFoundError('Track', 'abc-123');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toContain('Track');
    expect(err.message).toContain('abc-123');
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });

  it('NotFoundError works without id', () => {
    const err = new NotFoundError('Resource');
    expect(err.message).toBe('Resource not found');
  });

  it('ValidationError should have 422 status and optional details', () => {
    const details = [{ field: 'email', message: 'required' }];
    const err = new ValidationError('Invalid input', details);
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual(details);
  });

  it('UnauthorizedError should have 401 status', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('ForbiddenError should have 403 status', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('ConflictError should have 409 status', () => {
    const err = new ConflictError('Already exists');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('BadRequestError should have 400 status', () => {
    const err = new BadRequestError('Invalid format');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
  });
});
