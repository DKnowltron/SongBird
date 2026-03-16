const https = require('https');

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_e5a5f1e74b8973b58e0e19b4ca2ec15eeddae666';
const PROJECT_REF = 'ocftwwotizzopooxwgyi';

function query(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const bcrypt = require('bcrypt');
  const crypto = require('crypto');
  const { v4: uuidv4 } = require('uuid');

  console.log('Seeding Supabase database...\n');

  const passwordHash = await bcrypt.hash('password123', 10);
  const labelId = uuidv4();
  const artist1Id = uuidv4();
  const artist2Id = uuidv4();
  const adminId = uuidv4();
  const apiKey = 'stk_' + crypto.randomBytes(32).toString('hex');
  const apiKeyHash = await bcrypt.hash(apiKey, 10);

  // Run each insert separately to avoid escaping issues
  const statements = [
    {
      label: 'Label: Riggs Records',
      sql: `INSERT INTO labels (id, name, contact_email) VALUES ('${labelId}', 'Riggs Records', 'info@riggsrecords.com') ON CONFLICT DO NOTHING`,
    },
    {
      label: 'Artist: Test Artist 1',
      sql: `INSERT INTO artists (id, name, email, password_hash, role, label_id) VALUES ('${artist1Id}', 'Test Artist 1', 'artist1@test.com', '${passwordHash}', 'artist', '${labelId}') ON CONFLICT (email) DO NOTHING`,
    },
    {
      label: 'Artist: Test Artist 2',
      sql: `INSERT INTO artists (id, name, email, password_hash, role) VALUES ('${artist2Id}', 'Test Artist 2', 'artist2@test.com', '${passwordHash}', 'artist') ON CONFLICT (email) DO NOTHING`,
    },
    {
      label: 'Admin: Admin User',
      sql: `INSERT INTO artists (id, name, email, password_hash, role) VALUES ('${adminId}', 'Admin User', 'admin@storyteller.com', '${passwordHash}', 'admin') ON CONFLICT (email) DO NOTHING`,
    },
    {
      label: 'Track: Midnight Highway',
      sql: `INSERT INTO tracks (id, isrc, title, artist_id, album) VALUES ('${uuidv4()}', 'USRC12300001', 'Midnight Highway', '${artist1Id}', 'Road Stories') ON CONFLICT (isrc) DO NOTHING`,
    },
    {
      label: 'Track: Electric Dawn',
      sql: `INSERT INTO tracks (id, isrc, title, artist_id, album) VALUES ('${uuidv4()}', 'USRC12300002', 'Electric Dawn', '${artist1Id}', 'Road Stories') ON CONFLICT (isrc) DO NOTHING`,
    },
    {
      label: 'Track: Broken Compass',
      sql: `INSERT INTO tracks (id, isrc, title, artist_id, album) VALUES ('${uuidv4()}', 'USRC12300003', 'Broken Compass', '${artist1Id}', 'Lost & Found') ON CONFLICT (isrc) DO NOTHING`,
    },
    {
      label: 'Track: Summer Rain',
      sql: `INSERT INTO tracks (id, isrc, title, artist_id, album) VALUES ('${uuidv4()}', 'GBAYE1200004', 'Summer Rain', '${artist1Id}', NULL) ON CONFLICT (isrc) DO NOTHING`,
    },
    {
      label: 'Track: City Lights',
      sql: `INSERT INTO tracks (id, isrc, title, artist_id, album) VALUES ('${uuidv4()}', 'GBAYE1200005', 'City Lights', '${artist1Id}', 'Urban Tales') ON CONFLICT (isrc) DO NOTHING`,
    },
    {
      label: 'Partner: Test Platform',
      sql: `INSERT INTO partners (id, name, api_key_hash, status) VALUES ('${uuidv4()}', 'Test Platform', '${apiKeyHash}', 'active') ON CONFLICT DO NOTHING`,
    },
  ];

  for (const stmt of statements) {
    try {
      await query(stmt.sql);
      console.log(`  ✓ ${stmt.label}`);
    } catch (err) {
      console.error(`  ✗ ${stmt.label}: ${err.message}`);
    }
  }

  console.log('\nSeed complete.\n');
  console.log('Test credentials:');
  console.log('  Artist 1: artist1@test.com / password123');
  console.log('  Artist 2: artist2@test.com / password123');
  console.log('  Admin:    admin@storyteller.com / password123');
  console.log(`  Partner API key: ${apiKey}`);

  // Verify
  const counts = await query('SELECT (SELECT count(*) FROM labels) as labels, (SELECT count(*) FROM artists) as artists, (SELECT count(*) FROM tracks) as tracks, (SELECT count(*) FROM partners) as partners');
  console.log('\nDatabase counts:', counts[0]);
}

main().catch(console.error);
