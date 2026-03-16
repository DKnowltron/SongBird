import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/crypto.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { isSupabaseConfigured, getSupabaseAdmin } from '../services/supabase.js';
import { query } from '../db/connection.js';

/**
 * JWT auth middleware for artist routes.
 * When Supabase is configured, verifies tokens via Supabase Auth.
 * Falls back to local JWT verification for dev/test.
 */
export async function jwtAuth(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  if (isSupabaseConfigured()) {
    await verifySupabaseToken(request, token);
  } else {
    verifyLocalToken(request, token);
  }
}

/**
 * Verify a Supabase-issued JWT and resolve the artist from our DB.
 */
async function verifySupabaseToken(request: FastifyRequest, token: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  // Look up artist by supabase_user_id
  const result = await query<{ id: string; email: string; role: string }>(
    'SELECT id, email, role FROM artists WHERE supabase_user_id = $1',
    [data.user.id],
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('No artist profile linked to this account');
  }

  const artist = result.rows[0];
  request.artistId = artist.id;
  request.artistEmail = artist.email;
  request.artistRole = artist.role;
}

/**
 * Verify a locally-issued JWT (dev/test fallback).
 */
function verifyLocalToken(request: FastifyRequest, token: string) {
  try {
    const payload = verifyToken(token);
    request.artistId = payload.artistId;
    request.artistEmail = payload.email;
    request.artistRole = payload.role;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Admin role check — must be used after jwtAuth
 */
export async function adminAuth(request: FastifyRequest, _reply: FastifyReply) {
  await jwtAuth(request, _reply);
  if (request.artistRole !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }
}

export async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate('jwtAuth', jwtAuth);
  fastify.decorate('adminAuth', adminAuth);
}
