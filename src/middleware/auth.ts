import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/crypto.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * JWT auth middleware for artist routes.
 * Extracts artist identity from the JWT and attaches to request.
 * Designed to be swappable — when Supabase Auth is connected,
 * just change the verification logic here.
 */
export async function jwtAuth(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

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
