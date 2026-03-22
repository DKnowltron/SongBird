# Session: Song Content Pages & Affiliate Link System

**Date:** 2026-03-22
**Branch:** `feature/song-content-pages`
**Goal:** Add song content pages that aggregate external content (interviews, articles, podcasts) about songs, with affiliate link support for monetization.

## Context

Storyteller needs content volume. Not every song will have an artist-recorded story immediately. Song content pages solve this by:
1. Linking to existing external content (YouTube interviews, podcasts, articles) — no licensing required
2. Citing sources and using affiliate links for monetization
3. Creating a page for every track that has value even without an artist story
4. Driving artist recording — artists see their page exists and are motivated to add an official story

## Business Model

- **Artist-recorded stories** → platform revenue (subscription/rev share)
- **Curated external links** → affiliate revenue (Spotify, Apple Music, YouTube, Amazon, tickets)
- No fee charged for curated content — free layer that drives engagement

## What Was Built

### Database
- Migration `012_create_content_links.sql` — `content_links` table and `content_source` enum
- Migration `013_create_affiliate_configs.sql` — `affiliate_configs` table for managing affiliate tag templates

### API (new module: `src/modules/content-links/`)
- `GET /v1/tracks/:track_id/content` — list content links for a track (public, no auth required)
- `POST /v1/tracks/:track_id/content` — add a content link (authenticated)
- `PUT /v1/content-links/:id` — update a content link
- `DELETE /v1/content-links/:id` — remove a content link
- `POST /v1/content-links/:id/approve` — admin approves a community-submitted link
- `GET /v1/content-links/pending` — admin lists unapproved links

### Key Design Decisions
- Content links are per-track, not per-story
- Links can be added by artists, labels, or community (with moderation)
- Affiliate URL wrapping happens at read time, not write time
- Source attribution is always displayed

## Decisions Made
- DEC-015: Song content pages with affiliate monetization

## Learnings
- (to be filled)
