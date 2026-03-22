# StorySong — Data Model

## Entities

### Artist
Represents a music artist who creates stories.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | string | Artist display name |
| email | string | Login email |
| label_id | UUID (nullable) | Associated label, if any |
| avatar_url | string (nullable) | Profile image |
| verified_identity | boolean | Whether artist identity has been confirmed |
| created_at | timestamp | Account creation |
| updated_at | timestamp | Last update |

### Label
Represents a record label that manages multiple artists.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | string | Label name |
| contact_email | string | Primary contact |
| created_at | timestamp | |
| updated_at | timestamp | |

### Track
Represents a music track that can have stories linked to it. Tracks are references to songs that exist on streaming platforms — Storyteller does not host the music.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| isrc | string (unique) | International Standard Recording Code — the universal link to streaming platforms |
| title | string | Track title |
| artist_id | UUID | The artist who owns this track in Storyteller |
| album | string (nullable) | Album name |
| metadata | jsonb (nullable) | Additional track metadata (genre, release date, etc.) |
| created_at | timestamp | |
| updated_at | timestamp | |

### Story
The core entity. An audio narrative about a track.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| track_id | UUID | The track this story is about |
| artist_id | UUID | The artist who owns/created this story |
| source_type | enum | `artist_recording`, `ai_generated`, `archival_compilation` |
| status | enum | `draft`, `published`, `verified`, `rejected` |
| priority | integer | Determines playback order when multiple stories exist (1 = highest) |
| audio_asset_id | UUID | Reference to the audio file in asset storage |
| transcript | text (nullable) | Text transcript of the story |
| duration_seconds | decimal | Length of the story audio |
| version | integer | Incremented when story is replaced |
| verified_at | timestamp (nullable) | When the artist verified this story |
| verified_by | UUID (nullable) | Who verified (artist or label manager) |
| rejection_reason | text (nullable) | Why a story was rejected |
| created_at | timestamp | |
| updated_at | timestamp | |

**Notes:**
- A track can have multiple stories (one per source_type), but only one is active/distributed at a time based on priority.
- v1 only supports `artist_recording` as source_type. `ai_generated` and `archival_compilation` are reserved for future use.
- When an artist replaces a story, a new Story record is created with an incremented version. The old version is kept for audit purposes but marked inactive.

### AudioAsset
Represents a stored audio file.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| storage_key | string | Key/path in object storage |
| format | string | Audio format (e.g., `mp3`, `wav`, `aac`) |
| size_bytes | integer | File size |
| duration_seconds | decimal | Audio duration |
| sample_rate | integer | Audio sample rate |
| uploaded_by | UUID | Artist or system that uploaded |
| created_at | timestamp | |

### Partner
Represents a streaming platform that consumes stories.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | string | Platform name (e.g., "Spotify", "Apple Music") |
| api_key_hash | string | Hashed API key for authentication |
| webhook_url | string (nullable) | URL to notify when stories are updated |
| status | enum | `active`, `inactive`, `onboarding` |
| created_at | timestamp | |
| updated_at | timestamp | |

### Distribution
Tracks the distribution status of a story to a specific partner platform.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| story_id | UUID | Which story |
| partner_id | UUID | Which streaming platform |
| status | enum | `pending`, `delivered`, `acknowledged`, `failed` |
| delivered_at | timestamp (nullable) | When the story was delivered |
| error_message | text (nullable) | If delivery failed |
| created_at | timestamp | |
| updated_at | timestamp | |

### AuditEvent
Immutable log of significant actions for compliance and dispute resolution.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| event_type | string | e.g., `story_created`, `story_verified`, `story_rejected`, `story_distributed`, `story_replaced` |
| actor_id | UUID | Who performed the action |
| actor_type | string | `artist`, `label_manager`, `system`, `partner` |
| resource_type | string | `story`, `track`, `artist` |
| resource_id | UUID | The affected resource |
| details | jsonb | Event-specific data |
| created_at | timestamp | |

### ContentLink
External content link for a song content page. Links to interviews, articles, podcasts, and social posts about a track.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| track_id | UUID | The track this content is about |
| url | string | External URL (YouTube, podcast, article, etc.) |
| title | string | Display title for the link |
| source | enum | `youtube`, `podcast`, `article`, `social`, `other` |
| description | string (nullable) | Brief description of the content |
| duration | string (nullable) | Content duration (e.g., "4:21", "22m") |
| thumbnail_url | string (nullable) | Preview image URL |
| added_by | UUID (nullable) | Artist who submitted the link |
| approved | boolean | Whether the link has been moderated/approved |
| created_at | timestamp | |
| updated_at | timestamp | |

**Notes:**
- Content links are external — Storyteller does not host this content, only links to it.
- All links require approval before being publicly visible (moderation queue).
- Affiliate URLs are applied at read time via the `affiliate_configs` table.
- A track + URL pair must be unique (no duplicate links).

### AffiliateConfig
Configuration for wrapping external URLs with affiliate tracking tags.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| source | enum | Content source type this config applies to |
| domain_pattern | string | Domain substring to match (e.g., "youtube.com") |
| affiliate_tag | string | Affiliate tag/ID to append |
| url_template | string | Template with `{url}` and `{tag}` placeholders |
| active | boolean | Whether this config is active |
| created_at | timestamp | |
| updated_at | timestamp | |

## Relationships

```
Label (1) ──── (many) Artist
Artist (1) ──── (many) Track
Track (1) ──── (many) Story         (one per source_type, one active at a time)
Story (1) ──── (1) AudioAsset
Story (1) ──── (many) Distribution  (one per partner platform)
Partner (1) ──── (many) Distribution
Track (1) ──── (many) ContentLink   (curated external content)
```

- An **Artist** belongs to zero or one **Label**
- An **Artist** has many **Tracks** (registered in Storyteller)
- A **Track** has zero or more **Stories** (typically one active story)
- A **Story** has exactly one **AudioAsset**
- A **Story** has one **Distribution** record per **Partner** platform
- A **Track** has zero or more **ContentLinks** (curated external content about the song)
- **AuditEvents** reference any entity but have no foreign key constraints (append-only log)

## Storage

### Relational database — PostgreSQL
All structured entities (Artist, Label, Track, Story, Partner, Distribution, AuditEvent) live in PostgreSQL.

**Key indexes:**
- `Track.isrc` — unique index, primary lookup path for distribution API
- `Story.track_id` + `Story.status` — find active stories for a track
- `Story.artist_id` — artist's story dashboard
- `Distribution.story_id` + `Distribution.partner_id` — unique, track delivery status
- `AuditEvent.resource_type` + `AuditEvent.resource_id` — audit trail per resource
- `AuditEvent.created_at` — time-range queries

### Object storage — S3-compatible
Audio files stored in object storage, referenced by `AudioAsset.storage_key`.

**Organization:**
```
stories/
  {artist_id}/
    {track_isrc}/
      {story_id}.{format}
```

**Access:** Signed URLs generated on demand. Streaming platforms access audio via time-limited signed URLs provided through the distribution API.

### Caching
- Story metadata for frequently accessed tracks (Redis or similar)
- Signed URL caching with TTL matching URL expiry
- Partner webhook delivery queue (Redis or message queue)

### Future storage additions
- **Search index** (Elasticsearch/OpenSearch) — when archival compilation needs full-text search across transcripts and interviews
- **Knowledge graph DB** (Neo4j or similar) — when AI pipeline needs relationship-aware queries
- **Analytics warehouse** — when engagement data flows back from streaming platforms
