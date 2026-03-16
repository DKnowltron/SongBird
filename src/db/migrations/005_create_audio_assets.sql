CREATE TABLE audio_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key TEXT NOT NULL,
  format TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  duration_seconds NUMERIC(10, 2) NOT NULL,
  sample_rate INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES artists(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
