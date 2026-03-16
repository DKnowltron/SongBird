import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from '../config/env.js';

let _supabaseAdmin: SupabaseClient | null = null;
let _supabasePublic: SupabaseClient | null = null;

/**
 * Admin client — uses service role key, bypasses RLS.
 * Use for server-side operations (user management, storage admin).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const env = getEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase admin client');
  }

  _supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _supabaseAdmin;
}

/**
 * Public client — uses anon key, respects RLS.
 * Use for operations that should go through normal auth flow.
 */
export function getSupabasePublic(): SupabaseClient {
  if (_supabasePublic) return _supabasePublic;

  const env = getEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required for Supabase public client');
  }

  _supabasePublic = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _supabasePublic;
}

/**
 * Check if Supabase is configured (all required env vars present).
 */
export function isSupabaseConfigured(): boolean {
  const env = getEnv();
  return !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY);
}
