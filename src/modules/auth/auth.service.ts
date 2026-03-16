import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection.js';
import { hashPassword, verifyPassword, generateToken } from '../../utils/crypto.js';
import { ConflictError, UnauthorizedError } from '../../utils/errors.js';
import type { RegisterInput, LoginInput } from './auth.schemas.js';

export async function register(input: RegisterInput) {
  // Check for existing email
  const existing = await query('SELECT id FROM artists WHERE email = $1', [input.email]);
  if (existing.rows.length > 0) {
    throw new ConflictError('An account with this email already exists');
  }

  const id = uuidv4();
  const passwordHash = await hashPassword(input.password);

  const result = await query<{ id: string; name: string; email: string }>(
    `INSERT INTO artists (id, name, email, password_hash, label_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [id, input.name, input.email, passwordHash, input.label_id || null],
  );

  const artist = result.rows[0];
  const token = generateToken({ artistId: artist.id, email: artist.email });

  return {
    id: artist.id,
    name: artist.name,
    email: artist.email,
    token,
  };
}

export async function login(input: LoginInput) {
  const result = await query<{
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: string;
  }>('SELECT id, name, email, password_hash, role FROM artists WHERE email = $1', [input.email]);

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const artist = result.rows[0];
  const valid = await verifyPassword(input.password, artist.password_hash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken({
    artistId: artist.id,
    email: artist.email,
    role: artist.role,
  });

  return {
    token,
    artist: {
      id: artist.id,
      name: artist.name,
      email: artist.email,
    },
  };
}
