# StorySong — API Design

## Overview

Storyteller exposes two API surfaces:

1. **Artist API** — used by the web and mobile artist portal for story management
2. **Distribution API** — used by streaming platform partners to consume story assets

Both are REST APIs over HTTPS with JSON request/response bodies. Authentication differs by surface:
- **Artist API:** Session-based auth (login with email/password or OAuth), JWT tokens
- **Distribution API:** API key authentication (per-partner keys)

**Versioning:** URL-based (`/v1/...`). Breaking changes require a new version.

---

## Artist API

### Auth

#### `POST /v1/auth/register`
Create a new artist account.

**Request:**
```json
{
  "name": "Artist Name",
  "email": "artist@example.com",
  "password": "...",
  "label_id": "uuid (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Artist Name",
  "email": "artist@example.com",
  "token": "jwt-token"
}
```

**Errors:** `409 Conflict` (email taken), `422 Unprocessable Entity` (validation)

#### `POST /v1/auth/login`
Authenticate and receive a token.

**Request:**
```json
{
  "email": "artist@example.com",
  "password": "..."
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt-token",
  "artist": { "id": "uuid", "name": "...", "email": "..." }
}
```

**Errors:** `401 Unauthorized`

---

### Tracks

#### `GET /v1/tracks`
List the artist's tracks registered in Storyteller.

**Query params:** `?page=1&per_page=20&search=keyword`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "isrc": "USUM12345678",
      "title": "Song Title",
      "album": "Album Name",
      "story_count": 1,
      "has_verified_story": true
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 54 }
}
```

#### `POST /v1/tracks`
Register a track in Storyteller (link it by ISRC).

**Request:**
```json
{
  "isrc": "USUM12345678",
  "title": "Song Title",
  "album": "Album Name",
  "metadata": {}
}
```

**Response:** `201 Created`

**Errors:** `409 Conflict` (ISRC already registered by this artist), `422` (invalid ISRC)

#### `GET /v1/tracks/:id`
Get track details including its stories.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "isrc": "USUM12345678",
  "title": "Song Title",
  "album": "Album Name",
  "stories": [
    {
      "id": "uuid",
      "source_type": "artist_recording",
      "status": "verified",
      "duration_seconds": 22.5,
      "version": 1,
      "created_at": "2026-03-16T..."
    }
  ]
}
```

---

### Stories

#### `POST /v1/tracks/:track_id/stories`
Create a new story for a track. Accepts multipart upload (audio file) or a reference to a recording made in-app.

**Request (multipart/form-data):**
- `audio` — audio file (mp3, wav, aac; max 10MB; max 5 minutes)
- `transcript` — optional text transcript

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "track_id": "uuid",
  "source_type": "artist_recording",
  "status": "draft",
  "duration_seconds": 25.3,
  "version": 1,
  "audio_url": "signed-url",
  "created_at": "2026-03-16T..."
}
```

**Errors:** `400` (invalid audio format/duration), `404` (track not found), `403` (not your track)

#### `GET /v1/stories/:id`
Get story details.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "track_id": "uuid",
  "source_type": "artist_recording",
  "status": "verified",
  "priority": 1,
  "duration_seconds": 25.3,
  "version": 1,
  "transcript": "This song was written when...",
  "audio_url": "signed-url",
  "verified_at": "2026-03-16T...",
  "created_at": "2026-03-16T..."
}
```

#### `PUT /v1/stories/:id`
Replace a story's audio (creates a new version).

**Request (multipart/form-data):**
- `audio` — new audio file
- `transcript` — optional updated transcript

**Response:** `200 OK` (returns updated story with incremented version)

#### `DELETE /v1/stories/:id`
Remove a story. Marks as deleted (soft delete for audit trail).

**Response:** `204 No Content`

#### `POST /v1/stories/:id/verify`
Artist verifies (approves) a story.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "verified",
  "verified_at": "2026-03-16T..."
}
```

#### `POST /v1/stories/:id/reject`
Artist rejects a story.

**Request:**
```json
{
  "reason": "The story doesn't accurately describe the song"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "rejected",
  "rejection_reason": "..."
}
```

#### `POST /v1/stories/:id/publish`
Publish a draft story, making it available for distribution.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "published"
}
```

---

### Catalog Import

#### `POST /v1/tracks/import`
Bulk import tracks from a CSV file. Each row must include ISRC and track title.

**Request (multipart/form-data):**
- `file` — CSV file with columns: `isrc`, `title`, `album` (optional)

**Response:** `200 OK`
```json
{
  "imported": 42,
  "skipped": 3,
  "errors": [
    { "row": 12, "isrc": "INVALID", "reason": "Invalid ISRC format" }
  ]
}
```

**Errors:** `400` (invalid CSV format), `413` (file too large)

#### `POST /v1/tracks/search`
Search for tracks by artist name or title (queries external music metadata).

**Request:**
```json
{
  "query": "Artist Name",
  "type": "artist"
}
```

**Response:** `200 OK`
```json
{
  "results": [
    { "isrc": "USUM12345678", "title": "Song Title", "album": "Album", "artist": "Artist Name" }
  ]
}
```

> **Note:** This endpoint may query external APIs (MusicBrainz, etc.) and is rate-limited.

---

### Dashboard

#### `GET /v1/dashboard`
Overview stats for the logged-in artist.

**Response:** `200 OK`
```json
{
  "total_tracks": 54,
  "tracks_with_stories": 12,
  "stories_verified": 10,
  "stories_draft": 2,
  "stories_distributed": 10
}
```

---

### Notifications

#### `GET /v1/notifications`
List notifications for the logged-in artist.

**Query params:** `?unread=true&page=1&per_page=20`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "story_distributed",
      "message": "Your story for 'Song Title' was distributed to Spotify",
      "read": false,
      "created_at": "2026-03-16T..."
    }
  ],
  "unread_count": 3
}
```

#### `POST /v1/notifications/:id/read`
Mark a notification as read.

**Response:** `204 No Content`

---

## Admin API

Internal API for platform operators. Authenticated via admin session/role.

#### `GET /v1/admin/moderation`
List stories pending moderation review.

**Query params:** `?status=flagged&page=1&per_page=20`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "story_id": "uuid",
      "artist_name": "Artist Name",
      "track_title": "Song Title",
      "flag_reason": "auto_detected_explicit",
      "created_at": "2026-03-16T..."
    }
  ]
}
```

#### `POST /v1/admin/moderation/:story_id/approve`
Approve a flagged story for distribution.

**Response:** `200 OK`

#### `POST /v1/admin/moderation/:story_id/reject`
Reject a flagged story.

**Request:**
```json
{
  "reason": "Contains copyrighted material from another artist"
}
```

**Response:** `200 OK`

#### `GET /v1/admin/partners`
List all streaming platform partners and their status.

#### `POST /v1/admin/partners`
Onboard a new streaming platform partner (generate API key, set webhook URL).

#### `GET /v1/admin/stats`
System-wide stats: total artists, stories, distribution status, error rates.

---

## Distribution API

Used by streaming platform partners. Authenticated via API key in the `Authorization` header:
```
Authorization: Bearer <partner-api-key>
```

### Stories

#### `GET /v1/partner/stories`
List available stories. Partners use this to sync their catalog.

**Query params:**
- `?updated_since=2026-03-15T00:00:00Z` — only stories updated after this time (for incremental sync)
- `?isrc=USUM12345678` — filter by track ISRC
- `?page=1&per_page=100`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "isrc": "USUM12345678",
      "track_title": "Song Title",
      "artist_name": "Artist Name",
      "source_type": "artist_recording",
      "status": "verified",
      "duration_seconds": 25.3,
      "transcript": "This song was written when...",
      "audio_url": "signed-url (time-limited)",
      "verified": true,
      "verified_at": "2026-03-16T...",
      "updated_at": "2026-03-16T..."
    }
  ],
  "pagination": { "page": 1, "per_page": 100, "total": 340 }
}
```

#### `GET /v1/partner/stories/:isrc`
Get the active story for a specific track by ISRC.

**Response:** `200 OK` (same shape as single item above)

**Errors:** `404` (no story for this ISRC)

#### `GET /v1/partner/stories/:id/audio`
Download the story audio file.

**Response:** `302 Redirect` to signed audio URL

---

### Webhooks

Partners register a webhook URL to receive real-time notifications.

#### Webhook payload
```json
{
  "event": "story.published",
  "timestamp": "2026-03-16T...",
  "data": {
    "story_id": "uuid",
    "isrc": "USUM12345678",
    "artist_name": "Artist Name",
    "track_title": "Song Title",
    "status": "verified",
    "audio_url": "signed-url"
  }
}
```

**Event types:**
- `story.published` — new story available
- `story.updated` — story audio or metadata changed
- `story.verified` — artist verified a story
- `story.removed` — story deleted or rejected

Webhooks include a signature header for verification:
```
X-Storyteller-Signature: sha256=...
```

---

## External API Integrations

### Music metadata (future)
To help artists find and link their tracks, Storyteller may integrate with a music metadata API (e.g., MusicBrainz, Spotify Web API) for ISRC lookup and track search. Not required for v1 if artists provide ISRCs directly.

### Transcription service (future)
To auto-generate transcripts from uploaded story audio. Could use a service like Whisper or a managed transcription API.

### AI generation APIs (future)
When the AI pipeline is added: LLM for narrative text generation, voice synthesis API for artist voice likeness. These will be behind the AI Narrative Generation Engine and won't be exposed through the public API.
