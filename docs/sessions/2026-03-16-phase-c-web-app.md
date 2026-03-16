# 2026-03-16 — Phase C: Next.js Web App

## Context
Phases A and B are complete and merged to main. The backend API is fully functional with Supabase Auth and Storage integrated. This session builds the artist-facing web application.

## What was built

### Project scaffold
- Next.js 16 with TypeScript, Tailwind CSS, App Router, `src/` directory
- Lives in `web/` directory (monorepo layout — backend at root, web app in `web/`)
- Supabase JS client configured for both client and server components
- API client (`lib/api.ts`) with typed error handling and FormData support

### Auth
- Supabase Auth integration with email/password, Google OAuth, Apple Sign-In
- Auth context provider (`lib/auth-context.tsx`) — session management, auto-resolve artist profile via `/v1/auth/oauth/callback`
- Login page with email/password form and OAuth buttons
- Register page with name/email/password form and OAuth buttons
- OAuth callback page for redirect handling
- Protected route layout — redirects to `/login` if no session

### Pages (11 routes)
- **Dashboard** — stat cards (total tracks, stories verified, drafts, distributed)
- **Tracks** — table view with search, add track form, CSV import form
- **Track detail** — shows track info, stories list, record/upload buttons
- **Stories** — overview grid split by "has stories" vs "needs stories"
- **Notifications** — list with unread count and mark-as-read
- **Admin: Moderation** — flagged content queue with approve/reject
- **Admin: Partners** — partner list with add form (shows generated API key)

### Components
- **Sidebar** — navigation with active state, user info, sign out
- **StoryRecorder** — Web Audio API recorder with start/stop, playback preview, upload with transcript

### Infrastructure
- Custom hooks (`useApi`, `useApiMutation`) for data fetching with auth token injection
- Color theme with CSS custom properties (light + dark mode)
- `.env.example` for web app config

## Decisions made
- **Monorepo layout**: Web app in `web/` directory, not a separate repo. Keeps everything in one place, shared git history. No decision needed for build tooling — Next.js is self-contained.
- **No component library**: Built with Tailwind utility classes directly. The app is small enough that a component library (shadcn, Radix) would be overhead. Can add later if needed.
- **Client-side auth protection**: The `(app)/layout.tsx` checks session on the client and redirects to `/login`. No server-side middleware auth gate — simpler and avoids hydration issues with Supabase's client-side session.
- **WebM recording format**: Browser MediaRecorder outputs WebM by default. The backend will need to accept `audio/webm` or transcode to MP3. This is a known limitation — see open items.

## Regressions found
None during this session.

## PRs
- PR pending — branch `feature/web-app`

## Learnings
- Next.js 16 deprecated the `middleware.ts` convention in favor of `proxy`. The build warns about it but it still works. Worth migrating in a future cleanup.
- `create-next-app` v16 uses Tailwind v4 with `@import "tailwindcss"` instead of the `@tailwind` directives. Custom theme values use `@theme inline` block.

## Open items
- Backend needs to accept `audio/webm` MIME type (currently only accepts mp3/wav/aac) — the Web Audio recorder outputs WebM
- Supabase Storage bucket MIME types need updating to include `audio/webm`
- End-to-end testing of the full flow (register → add track → record story → publish)
- Deploy web app (Vercel or same PaaS as API)
