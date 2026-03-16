import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from './auth.schemas.js';

describe('registerSchema', () => {
  it('should accept valid registration', () => {
    const result = registerSchema.parse({
      name: 'Test Artist',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.name).toBe('Test Artist');
    expect(result.email).toBe('test@example.com');
  });

  it('should reject invalid email', () => {
    expect(() =>
      registerSchema.parse({
        name: 'Test',
        email: 'not-an-email',
        password: 'password123',
      }),
    ).toThrow();
  });

  it('should reject short password', () => {
    expect(() =>
      registerSchema.parse({
        name: 'Test',
        email: 'test@example.com',
        password: 'short',
      }),
    ).toThrow();
  });

  it('should allow optional label_id', () => {
    const result = registerSchema.parse({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.label_id).toBeUndefined();
  });
});

describe('loginSchema', () => {
  it('should accept valid login', () => {
    const result = loginSchema.parse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.email).toBe('test@example.com');
  });

  it('should reject missing password', () => {
    expect(() =>
      loginSchema.parse({
        email: 'test@example.com',
      }),
    ).toThrow();
  });
});
