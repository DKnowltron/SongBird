import { FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../db/connection.js';
import { verifyApiKey } from '../utils/crypto.js';
import { UnauthorizedError } from '../utils/errors.js';

/**
 * API key auth middleware for partner routes.
 * Partners authenticate with: Authorization: Bearer <api-key>
 * The key is verified against bcrypt hashes stored in the partners table.
 */
export async function apiKeyAuth(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid API key');
  }

  const apiKey = authHeader.slice(7);

  // Fetch all active partners and check the key against each hash
  // In production, you'd cache this or use a prefix-based lookup
  const result = await query<{ id: string; api_key_hash: string }>(
    `SELECT id, api_key_hash FROM partners WHERE status = 'active'`,
  );

  for (const partner of result.rows) {
    const matches = await verifyApiKey(apiKey, partner.api_key_hash);
    if (matches) {
      request.partnerId = partner.id;
      return;
    }
  }

  throw new UnauthorizedError('Invalid API key');
}
