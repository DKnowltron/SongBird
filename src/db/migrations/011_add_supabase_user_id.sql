ALTER TABLE artists ADD COLUMN supabase_user_id UUID UNIQUE;
ALTER TABLE artists ALTER COLUMN password_hash DROP NOT NULL;
CREATE INDEX idx_artists_supabase_user_id ON artists(supabase_user_id);
