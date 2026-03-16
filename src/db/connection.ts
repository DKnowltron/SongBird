import pg from 'pg';
import https from 'https';
import { getEnv } from '../config/env.js';
import { getLogger } from '../utils/logger.js';

const { Pool } = pg;

let _pool: pg.Pool | null = null;
let _useManagementApi = false;
let _managementConfig: { projectRef: string; accessToken: string } | null = null;

/**
 * Initializes the database connection.
 * If DATABASE_URL is set, uses direct pg connection.
 * Otherwise falls back to Supabase Management API (for devcontainer use).
 */
export function initDb(): void {
  const env = getEnv();

  if (env.DATABASE_URL) {
    _useManagementApi = false;
    _pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    _pool.on('error', (err) => {
      const logger = getLogger();
      logger.error({ err }, 'Unexpected error on idle database client');
    });
  } else if (env.SUPABASE_PROJECT_REF && env.SUPABASE_ACCESS_TOKEN) {
    _useManagementApi = true;
    _managementConfig = {
      projectRef: env.SUPABASE_PROJECT_REF,
      accessToken: env.SUPABASE_ACCESS_TOKEN,
    };
    const logger = getLogger();
    logger.info('Using Supabase Management API for database queries (no direct DB connection)');
  } else {
    throw new Error(
      'Database not configured. Set DATABASE_URL for direct connection, or SUPABASE_PROJECT_REF + SUPABASE_ACCESS_TOKEN for Management API.',
    );
  }
}

export function getPool(): pg.Pool {
  if (!_pool && !_useManagementApi) {
    initDb();
  }
  if (_useManagementApi) {
    // Return a proxy that routes through the management API
    throw new Error('Direct pool access not available in Management API mode. Use query() instead.');
  }
  return _pool!;
}

/**
 * Execute a parameterized SQL query.
 * Works with both direct pg and Supabase Management API.
 */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  const start = Date.now();

  if (_useManagementApi) {
    const result = await managementApiQuery<T>(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      const logger = getLogger();
      logger.warn({ duration, query: text.substring(0, 100) }, 'Slow query detected');
    }
    return result;
  }

  if (!_pool) initDb();
  const result = await _pool!.query<T>(text, params);
  const duration = Date.now() - start;

  if (duration > 1000) {
    const logger = getLogger();
    logger.warn({ duration, query: text.substring(0, 100) }, 'Slow query detected');
  }

  return result;
}

/**
 * Executes SQL via the Supabase Management API.
 * Converts parameterized queries ($1, $2) to literal values since
 * the management API only accepts raw SQL.
 */
async function managementApiQuery<T extends pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  if (!_managementConfig) {
    throw new Error('Management API not configured');
  }

  // Replace $1, $2, etc. with actual values
  let sql = text;
  if (params && params.length > 0) {
    sql = text.replace(/\$(\d+)/g, (_, index) => {
      const i = parseInt(index, 10) - 1;
      const val = params[i];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
      if (val instanceof Date) return `'${val.toISOString()}'`;
      // Escape single quotes for strings
      const escaped = String(val).replace(/'/g, "''");
      return `'${escaped}'`;
    });
  }

  const rows = await makeManagementRequest<T[]>(sql);

  return {
    rows: rows || [],
    rowCount: rows ? rows.length : 0,
    command: text.trim().split(/\s+/)[0].toUpperCase(),
    oid: 0,
    fields: [],
  } as pg.QueryResult<T>;
}

function makeManagementRequest<T>(sql: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${_managementConfig!.projectRef}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${_managementConfig!.accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Database query failed (HTTP ${res.statusCode}): ${body}`));
          return;
        }
        try {
          resolve(JSON.parse(body) as T);
        } catch {
          reject(new Error(`Failed to parse database response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
