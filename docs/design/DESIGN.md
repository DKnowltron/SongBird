# StorySong — Design

## Vision

**Storyteller** is a story distribution platform for the music industry. It enables artists to record audio narratives about their songs and distributes those stories to streaming platforms as a new content type — the same way music distributors (DistroKid, TuneCore, CD Baby) deliver tracks and metadata today.

The core insight: streaming killed liner notes. Every song has a story — its inspiration, meaning, the circumstances of its creation — but that context is disconnected from the listening experience. Storyteller brings it back as audio, delivered before the track plays.

**Who it's for:**
- **Artists and labels** — create, manage, and verify stories about their music
- **Streaming platforms** (Spotify, Apple Music, Amazon Music, YouTube Music) — consume story assets via API and integrate them into their playback experience

Listeners interact with stories through their streaming app. They never touch Storyteller directly.

## Core Experience

### Artist flow
1. Artist signs into the Storyteller platform (web or mobile)
2. Browses their catalog (tracks linked via ISRC)
3. Records a story in-app or uploads a pre-recorded audio file
4. Links the story to a specific track
5. Reviews and publishes the story
6. Story is distributed to all connected streaming platforms
7. Artist can later update, replace, or verify stories

### Streaming platform flow
1. Platform authenticates with Storyteller's distribution API
2. Receives story asset packages (audio, metadata, verification status)
3. Integrates stories into their playback — story plays before the track
4. Listener can enable/disable storytelling mode and skip stories
5. Platform receives updates when stories are added, changed, or verified

### Listener experience (on streaming platform)
1. Listener enables "Storytelling Mode" in settings
2. Presses play on a track
3. If a story exists: story audio plays, then the track begins
4. Listener can skip the story at any time
5. Optional repeat setting: story plays once or every time

## Key Features

### v1 (must-have)
1. **Artist story recording** — record audio stories directly in the app
2. **Story upload** — upload pre-recorded story audio files
3. **Track linking** — associate stories with tracks via ISRC / track ID
4. **Story management** — edit, replace, delete, version stories
5. **Artist verification** — approve or reject stories, with verification status visible to platforms
6. **Multi-label support** — multiple labels and artists from day one
7. **Distribution API** — streaming platforms pull story assets and metadata
8. **Story asset packaging** — audio file + transcript + metadata + verification status
9. **Webhook notifications** — alert platforms when stories are created or updated

### v2 (designed for, built later)
1. **AI narrative generation** — generate stories using AI when no artist recording exists
2. **AI voice likeness** — narrate AI stories in the artist's voice style
3. **Archival compilation** — assemble stories from past interviews, press, podcasts
4. **Lyrics validation** — cross-reference AI stories against lyrics to prevent hallucination
5. **Story source prioritization** — automatic ranking: artist recording > AI > archival
6. **Analytics dashboard** — story engagement metrics (completion rate, skip rate)
7. **Cross-platform verification sync** — verify once, propagate everywhere

### Future possibilities
- Instrumental background during story playback with seamless crossfade into track
- Interactive storytelling (listener asks AI questions about the song)
- Story playlists
- Story monetization (sponsored stories, premium content)
- Video storytelling mode
- AI-generated liner notes

## Artist Onboarding

### Identity verification
Artists must be verified before their stories can be distributed. Verification options:
1. **Label invitation** — a label manager invites an artist by email. The label vouches for identity.
2. **Distributor profile linking** — artist connects their existing DistroKid/TuneCore/etc. account to prove they own the catalog.
3. **Manual verification** — for independent artists without a label or distributor, manual review by Storyteller admin.

### Catalog import
Artists shouldn't have to enter ISRCs one by one. Options:
- **Bulk CSV upload** — artist or label uploads a spreadsheet of ISRCs and track titles
- **Distributor API integration** (future) — pull catalog directly from DistroKid/TuneCore
- **Search by artist name** — query a music metadata API (MusicBrainz, Spotify) to find tracks

### Audio requirements
| Parameter | Requirement |
|-----------|-------------|
| Formats accepted | MP3, WAV, AAC, WebM |
| Min duration | 5 seconds |
| Max duration | 5 minutes |
| Max file size | 10 MB |
| Sample rate | 44.1 kHz minimum |
| Channels | Mono or stereo |

## Content Moderation

### v1 (artist-recorded stories)
- Audio format and quality validation on upload
- Duration and file size enforcement
- Content policy: no hate speech, no copyrighted material from other artists, no explicit content without proper labeling
- Manual review queue for flagged content
- Admin moderation dashboard
- Artists agree to content policy on upload (terms of service)

### v2+ (AI-generated stories)
- AI guardrail layer between generation and publishing
- Hallucination prevention via lyrics cross-referencing
- Voice likeness consent verification before AI generation
- Bias detection across genres/demographics
- Automated content screening before human review
- Artist right to reject any AI-generated content about their work

## Go-to-Market

### Sell at v1
Don't wait for AI features. The pitch is the experience: real artist stories on a working platform.

### What's needed to sell
- Working platform with 20–50 real artist stories
- Clean demo of the artist recording flow
- Distribution API documentation showing simple integration
- Production plan (business case, costs, patent protection)
- Compelling audio examples a platform exec can listen to

### Target timeline
- v1 ready: ~month 4
- First artists onboarded: month 4–5
- Start streaming platform conversations: month 5–6

### First targets
1. **Spotify** — largest platform, most feature-forward
2. **Apple Music** — premium positioning, values artist relationships
3. **Amazon Music / YouTube Music** — secondary targets

## Constraints & Non-Goals

### Constraints
- Stories must be linkable to tracks via industry-standard identifiers (ISRC)
- Must conform to how streaming platforms already ingest content from distributors
- Audio quality must meet streaming platform standards
- Artist verification must be trustworthy (artists control their own narratives)
- Content moderation must be in place before distribution goes live
- Legal structure (LLC, equity, artist licensing) must be resolved before onboarding external artists

### Non-goals
- **Not a streaming platform** — Storyteller does not play music. It distributes story content.
- **Not a listener-facing app** — listeners use their existing streaming app
- **Not a social network** — no comments, likes, or follower features
- **Not a podcast platform** — stories are short-form, tied to specific tracks
- **Not building playback UI** — streaming platforms own the playback experience
