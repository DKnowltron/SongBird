import fs from 'node:fs/promises';
import path from 'node:path';
import { getEnv } from '../config/env.js';

export interface StorageService {
  upload(key: string, data: Buffer, contentType: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

/**
 * Local filesystem storage for development.
 * Files are stored in the configured STORAGE_PATH directory.
 */
export class LocalStorageService implements StorageService {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || getEnv().STORAGE_PATH;
  }

  async upload(key: string, data: Buffer, _contentType: string): Promise<void> {
    const fullPath = path.join(this.basePath, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, data);
  }

  async getSignedUrl(key: string, _expiresIn?: number): Promise<string> {
    // In local dev, just return a path-based URL
    // In production, this would generate a time-limited signed URL
    return `/storage/${key}`;
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.basePath, key);
    try {
      await fs.unlink(fullPath);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }
}

let _storage: StorageService | null = null;

export function getStorage(): StorageService {
  if (_storage) return _storage;

  const env = getEnv();
  switch (env.STORAGE_TYPE) {
    case 'local':
      _storage = new LocalStorageService(env.STORAGE_PATH);
      break;
    // Future: case 's3': case 'supabase':
    default:
      _storage = new LocalStorageService(env.STORAGE_PATH);
  }

  return _storage;
}
