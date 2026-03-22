-- Content source types for external links
CREATE TYPE content_source AS ENUM (
  'youtube',
  'podcast',
  'article',
  'social',
  'other'
);

-- External content links for song content pages
CREATE TABLE content_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  source content_source NOT NULL DEFAULT 'other',
  description TEXT,
  duration TEXT,
  thumbnail_url TEXT,
  added_by UUID REFERENCES artists(id) ON DELETE SET NULL,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_links_track_id ON content_links(track_id);
CREATE INDEX idx_content_links_approved ON content_links(approved);
CREATE UNIQUE INDEX idx_content_links_track_url ON content_links(track_id, url);
