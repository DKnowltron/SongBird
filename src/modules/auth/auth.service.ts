import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection.js';
import { hashPassword, verifyPassword, generateToken } from '../../utils/crypto.js';
import { ConflictError, UnauthorizedError } from '../../utils/errors.js';
import { isSupabaseConfigured, getSupabaseAdmin } from '../../services/supabase.js';
import type { RegisterInput, LoginInput, RefreshTokenInput, OAuthCallbackInput } from './auth.schemas.js';

export async function register(input: RegisterInput) {
  if (isSupabaseConfigured()) {
    return registerWithSupabase(input);
  }
  return registerLocal(input);
}

export async function login(input: LoginInput) {
  if (isSupabaseConfigured()) {
    return loginWithSupabase(input);
  }
  return loginLocal(input);
}

// --- Supabase Auth ---

async function registerWithSupabase(input: RegisterInput) {
  const supabase = getSupabaseAdmin();

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      throw new ConflictError('An account with this email already exists');
    }
    throw new Error(`Supabase Auth error: ${authError.message}`);
  }

  // Create artist record linked to Supabase user
  const id = uuidv4();
  const result = await query<{ id: string; name: string; email: string }>(
    `INSERT INTO artists (id, name, email, password_hash, label_id, supabase_user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email`,
    [id, input.name, input.email, 'supabase-managed', input.label_id || null, authData.user.id],
  );

  const artist = result.rows[0];

  // Sign in to get a session token
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (signInError || !signInData.session) {
    // User created but couldn't sign in — return without token, client can login
    return { id: artist.id, name: artist.name, email: artist.email, token: '' };
  }

  return {
    id: artist.id,
    name: artist.name,
    email: artist.email,
    token: signInData.session.access_token,
    refresh_token: signInData.session.refresh_token,
  };
}

async function loginWithSupabase(input: LoginInput) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Look up artist by supabase_user_id
  let result = await query<{ id: string; name: string; email: string }>(
    'SELECT id, name, email FROM artists WHERE supabase_user_id = $1',
    [data.user.id],
  );

  // Fall back to email lookup and link if found
  if (result.rows.length === 0) {
    result = await query<{ id: string; name: string; email: string }>(
      'SELECT id, name, email FROM artists WHERE email = $1',
      [data.user.email],
    );
    if (result.rows.length > 0) {
      await query('UPDATE artists SET supabase_user_id = $1 WHERE email = $2', [data.user.id, data.user.email]);
    }
  }

  if (result.rows.length === 0) {
    throw new UnauthorizedError('No artist profile linked to this account');
  }

  const artist = result.rows[0];
  return {
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    artist: { id: artist.id, name: artist.name, email: artist.email },
  };
}

// --- Refresh & OAuth ---

export async function refreshSession(input: RefreshTokenInput) {
  if (!isSupabaseConfigured()) {
    throw new UnauthorizedError('Token refresh requires Supabase Auth');
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: input.refresh_token,
  });

  if (error || !data.session) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  return {
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
}

export async function handleOAuthCallback(input: OAuthCallbackInput) {
  if (!isSupabaseConfigured()) {
    throw new UnauthorizedError('OAuth requires Supabase Auth');
  }

  const supabase = getSupabaseAdmin();

  // Verify the token and get user info
  const { data: userData, error } = await supabase.auth.getUser(input.access_token);
  if (error || !userData.user) {
    throw new UnauthorizedError('Invalid OAuth token');
  }

  const user = userData.user;

  // Check if artist already exists for this Supabase user
  const existing = await query<{ id: string; name: string; email: string }>(
    'SELECT id, name, email FROM artists WHERE supabase_user_id = $1',
    [user.id],
  );

  if (existing.rows.length > 0) {
    const artist = existing.rows[0];
    return {
      token: input.access_token,
      refresh_token: input.refresh_token,
      artist: { id: artist.id, name: artist.name, email: artist.email },
    };
  }

  // Check if artist exists by email (e.g. seed data without supabase_user_id)
  const byEmail = await query<{ id: string; name: string; email: string }>(
    'SELECT id, name, email FROM artists WHERE email = $1',
    [user.email],
  );

  if (byEmail.rows.length > 0) {
    // Link existing artist to Supabase user
    await query('UPDATE artists SET supabase_user_id = $1 WHERE email = $2', [user.id, user.email]);
    const artist = byEmail.rows[0];
    return {
      token: input.access_token,
      refresh_token: input.refresh_token,
      artist: { id: artist.id, name: artist.name, email: artist.email },
    };
  }

  // Auto-create artist profile from OAuth user
  const id = uuidv4();
  const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Artist';

  const result = await query<{ id: string; name: string; email: string }>(
    `INSERT INTO artists (id, name, email, supabase_user_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email`,
    [id, name, user.email, user.id],
  );

  const artist = result.rows[0];
  return {
    token: input.access_token,
    refresh_token: input.refresh_token,
    artist: { id: artist.id, name: artist.name, email: artist.email },
  };
}

// --- Local Auth (dev/test fallback) ---

async function registerLocal(input: RegisterInput) {
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

  return { id: artist.id, name: artist.name, email: artist.email, token };
}

async function loginLocal(input: LoginInput) {
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
    artist: { id: artist.id, name: artist.name, email: artist.email },
  };
}
