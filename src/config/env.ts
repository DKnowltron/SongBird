import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().optional(),
  SUPABASE_PROJECT_REF: z.string().optional(),
  SUPABASE_ACCESS_TOKEN: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default('story-audio'),
  JWT_SECRET: z.string().min(8),
  STORAGE_TYPE: z.enum(['local', 's3', 'supabase']).default('local'),
  STORAGE_PATH: z.string().default('./storage'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function loadEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }

  _env = result.data;
  return _env;
}

export function getEnv(): Env {
  if (!_env) {
    return loadEnv();
  }
  return _env;
}
