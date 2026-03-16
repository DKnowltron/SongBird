import { describe, it, expect, afterAll } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { LocalStorageService } from './storage.js';

describe('LocalStorageService', () => {
  const tmpDir = path.join(os.tmpdir(), `storyteller-test-${Date.now()}`);
  const storage = new LocalStorageService(tmpDir);

  afterAll(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true });
    } catch {}
  });

  it('should upload and retrieve a file URL', async () => {
    const key = 'test/file.txt';
    const data = Buffer.from('hello world');
    await storage.upload(key, data, 'text/plain');

    const url = await storage.getSignedUrl(key);
    expect(url).toBe(`/storage/${key}`);

    // Verify the file was written
    const content = await fs.readFile(path.join(tmpDir, key), 'utf-8');
    expect(content).toBe('hello world');
  });

  it('should delete a file', async () => {
    const key = 'test/delete-me.txt';
    await storage.upload(key, Buffer.from('delete me'), 'text/plain');
    await storage.delete(key);

    // Verify file is gone
    await expect(fs.access(path.join(tmpDir, key))).rejects.toThrow();
  });

  it('should not throw when deleting non-existent file', async () => {
    await expect(storage.delete('nonexistent/file.txt')).resolves.not.toThrow();
  });

  it('should create nested directories', async () => {
    const key = 'deep/nested/path/file.txt';
    await storage.upload(key, Buffer.from('nested'), 'text/plain');

    const content = await fs.readFile(path.join(tmpDir, key), 'utf-8');
    expect(content).toBe('nested');
  });
});
