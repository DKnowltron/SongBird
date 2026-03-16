CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  source_type source_type NOT NULL DEFAULT 'artist_recording',
  status story_status NOT NULL DEFAULT 'draft',
  priority INTEGER NOT NULL DEFAULT 1,
  audio_asset_id UUID NOT NULL REFERENCES audio_assets(id),
  transcript TEXT,
  duration_seconds NUMERIC(10, 2) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  rejection_reason TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stories_track_id_status ON stories(track_id, status);
CREATE INDEX idx_stories_artist_id ON stories(artist_id);
CREATE INDEX idx_stories_deleted_at ON stories(deleted_at);
