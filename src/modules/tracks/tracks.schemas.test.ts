import { describe, it, expect } from 'vitest';
import { createTrackSchema, listTracksSchema } from './tracks.schemas.js';

describe('createTrackSchema', () => {
  it('should accept valid input', () => {
    const result = createTrackSchema.parse({
      isrc: 'USRC12345678',
      title: 'Test Song',
      album: 'Test Album',
    });
    expect(result.isrc).toBe('USRC12345678');
    expect(result.title).toBe('Test Song');
  });

  it('should reject invalid ISRC format', () => {
    expect(() =>
      createTrackSchema.parse({
        isrc: 'INVALID',
        title: 'Test Song',
      }),
    ).toThrow();
  });

  it('should reject empty title', () => {
    expect(() =>
      createTrackSchema.parse({
        isrc: 'USRC12345678',
        title: '',
      }),
    ).toThrow();
  });

  it('should allow optional album', () => {
    const result = createTrackSchema.parse({
      isrc: 'USRC12345678',
      title: 'Test Song',
    });
    expect(result.album).toBeUndefined();
  });
});

describe('listTracksSchema', () => {
  it('should apply defaults', () => {
    const result = listTracksSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.per_page).toBe(20);
  });

  it('should coerce string numbers', () => {
    const result = listTracksSchema.parse({ page: '3', per_page: '50' });
    expect(result.page).toBe(3);
    expect(result.per_page).toBe(50);
  });

  it('should reject per_page over 100', () => {
    expect(() => listTracksSchema.parse({ per_page: '200' })).toThrow();
  });
});
