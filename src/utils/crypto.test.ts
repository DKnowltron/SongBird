import { describe, it, expect, beforeAll } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateApiKey,
  hashApiKey,
  verifyApiKey,
  generateWebhookSignature,
} from './crypto.js';

// Set up env for JWT
beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_SECRET = 'test-secret-for-testing';
});

describe('password hashing', () => {
  it('should hash and verify a password', async () => {
    const password = 'my-secure-password';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });
});

describe('JWT tokens', () => {
  it('should generate and verify a token', () => {
    const payload = { artistId: 'test-id', email: 'test@test.com' };
    const token = generateToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.artistId).toBe('test-id');
    expect(decoded.email).toBe('test@test.com');
  });

  it('should reject invalid tokens', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });
});

describe('API key generation', () => {
  it('should generate keys with st_ prefix', () => {
    const key = generateApiKey();
    expect(key).toMatch(/^st_[a-f0-9]{64}$/);
  });

  it('should hash and verify API keys', async () => {
    const key = generateApiKey();
    const hash = await hashApiKey(key);
    expect(await verifyApiKey(key, hash)).toBe(true);
    expect(await verifyApiKey('wrong-key', hash)).toBe(false);
  });
});

describe('webhook signatures', () => {
  it('should generate consistent HMAC signatures', () => {
    const payload = '{"event":"story.published"}';
    const secret = 'webhook-secret';
    const sig1 = generateWebhookSignature(payload, secret);
    const sig2 = generateWebhookSignature(payload, secret);
    expect(sig1).toBe(sig2);
    expect(sig1).toMatch(/^sha256=[a-f0-9]{64}$/);
  });

  it('should produce different signatures for different payloads', () => {
    const secret = 'webhook-secret';
    const sig1 = generateWebhookSignature('payload-1', secret);
    const sig2 = generateWebhookSignature('payload-2', secret);
    expect(sig1).not.toBe(sig2);
  });
});
