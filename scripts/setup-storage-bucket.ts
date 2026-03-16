import { loadEnv } from '../src/config/env.js';
import { getSupabaseAdmin } from '../src/services/supabase.js';

async function main() {
  loadEnv();
  const supabase = getSupabaseAdmin();

  // Create storage bucket for audio files
  const { data, error } = await supabase.storage.createBucket('story-audio', {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/mp4', 'audio/webm'],
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket "story-audio" already exists.');
    } else {
      console.error('Failed to create bucket:', error.message);
      process.exit(1);
    }
  } else {
    console.log('Created bucket:', data);
  }
}

main();
