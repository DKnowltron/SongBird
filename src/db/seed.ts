import { v4 as uuidv4 } from 'uuid';
import { getPool, closePool } from './connection.js';
import { loadEnv } from '../config/env.js';
import { hashPassword } from '../utils/crypto.js';
import { generateApiKey, hashApiKey } from '../utils/crypto.js';

async function seed() {
  loadEnv();
  const pool = getPool();

  console.log('Seeding database...');

  // Label
  const labelId = uuidv4();
  await pool.query(
    `INSERT INTO labels (id, name, contact_email)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [labelId, 'Riggs Records', 'info@riggsrecords.com'],
  );
  console.log('  Created label: Riggs Records');

  // Artists
  const artist1Id = uuidv4();
  const artist2Id = uuidv4();
  const passwordHash = await hashPassword('password123');

  await pool.query(
    `INSERT INTO artists (id, name, email, password_hash, role, label_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO NOTHING`,
    [artist1Id, 'Test Artist 1', 'artist1@test.com', passwordHash, 'artist', labelId],
  );

  await pool.query(
    `INSERT INTO artists (id, name, email, password_hash, role, label_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO NOTHING`,
    [artist2Id, 'Test Artist 2', 'artist2@test.com', passwordHash, 'artist', null],
  );

  // Admin user
  const adminId = uuidv4();
  await pool.query(
    `INSERT INTO artists (id, name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING`,
    [adminId, 'Admin User', 'admin@storyteller.com', passwordHash, 'admin'],
  );
  console.log('  Created artists: Test Artist 1, Test Artist 2, Admin User');

  // Tracks
  const tracks = [
    { isrc: 'USRC12300001', title: 'Midnight Highway', album: 'Road Stories' },
    { isrc: 'USRC12300002', title: 'Electric Dawn', album: 'Road Stories' },
    { isrc: 'USRC12300003', title: 'Broken Compass', album: 'Lost & Found' },
    { isrc: 'GBAYE1200004', title: 'Summer Rain', album: null },
    { isrc: 'GBAYE1200005', title: 'City Lights', album: 'Urban Tales' },
  ];

  for (const track of tracks) {
    await pool.query(
      `INSERT INTO tracks (id, isrc, title, artist_id, album)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (isrc) DO NOTHING`,
      [uuidv4(), track.isrc, track.title, artist1Id, track.album],
    );
  }
  console.log(`  Created ${tracks.length} tracks`);

  // Partner
  const partnerId = uuidv4();
  const apiKey = generateApiKey();
  const apiKeyHash = await hashApiKey(apiKey);

  await pool.query(
    `INSERT INTO partners (id, name, api_key_hash, status)
     VALUES ($1, $2, $3, 'active')
     ON CONFLICT DO NOTHING`,
    [partnerId, 'Test Platform', apiKeyHash],
  );
  console.log('  Created partner: Test Platform');
  console.log(`  Partner API key: ${apiKey}`);

  console.log('\nSeed complete.');
  console.log('\nTest credentials:');
  console.log('  Artist 1: artist1@test.com / password123');
  console.log('  Artist 2: artist2@test.com / password123');
  console.log('  Admin:    admin@storyteller.com / password123');
  console.log(`  Partner API key: ${apiKey}`);

  await closePool();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
