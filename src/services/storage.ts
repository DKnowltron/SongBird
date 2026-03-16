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

/**
 * Supabase Storage service for production.
 * Uses Supabase Storage buckets with signed URLs.
 */
export class SupabaseStorageService implements StorageService {
  private bucket: string;

  constructor(bucket?: string) {
    this.bucket = bucket || getEnv().SUPABASE_STORAGE_BUCKET;
  }

  async upload(key: string, data: Buffer, contentType: string): Promise<void> {
    const { getSupabaseAdmin } = await import('./supabase.js');
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(key, data, { contentType, upsert: true });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const { getSupabaseAdmin } = await import('./supabase.js');
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(key, expiresIn);

    if (error || !data?.signedUrl) {
      throw new Error(`Supabase Storage signed URL failed: ${error?.message}`);
    }

    return data.signedUrl;
  }

  async delete(key: string): Promise<void> {
    const { getSupabaseAdmin } = await import('./supabase.js');
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.storage
      .from(this.bucket)
      .remove([key]);

    if (error) {
      throw new Error(`Supabase Storage delete failed: ${error.message}`);
    }
  }
}

let _storage: StorageService | null = null;

export function getStorage(): StorageService {
  if (_storage) return _storage;

  const env = getEnv();
  switch (env.STORAGE_TYPE) {
    case 'supabase':
      _storage = new SupabaseStorageService(env.SUPABASE_STORAGE_BUCKET);
      break;
    case 'local':
    default:
      _storage = new LocalStorageService(env.STORAGE_PATH);
  }

  return _storage;
}
