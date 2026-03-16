# DK To-Dos

## Business / Legal (blocking for launch)
- [ ] File provisional patent at USPTO ($75-150) — draft is ready
- [ ] Form LLC and finalize equity agreement with Robert
- [ ] Define artist content licensing terms (who owns uploaded stories)
- [ ] Send production plan PDF to Robert for feedback

## Supabase Config (blocking for full auth)
- [ ] Enable Google OAuth in Supabase Dashboard (needs Google Cloud Console OAuth credentials)
- [ ] Enable Apple Sign-In in Supabase Dashboard (needs Apple Developer account)
- [ ] Fix direct Postgres connection (REG-001) — reset DB password in Supabase dashboard to remove special characters

## Deployment (blocking for public access)
- [ ] Sign up for a PaaS (Railway, Render, or Fly.io) — deploy the API
- [ ] Sign up for Vercel — deploy the web app
- [ ] Set environment variables in both platforms (see DEPLOY.md)
- [ ] Lock down CORS to your web app domain

## Mobile Testing & Publishing
- [ ] Install Expo Go on your phone
- [ ] Update `EXPO_PUBLIC_API_URL` in `mobile/.env` to your machine's local IP (not localhost)
- [ ] Test mobile app on physical device: login, view tracks, record a story
- [ ] Apple Developer account ($99/year) — required for App Store
- [ ] Google Play Developer account ($25 one-time) — required for Play Store

## Content (before selling to platforms)
- [ ] Onboard Robert's label artists and get 20-50 real stories recorded
- [ ] Prepare demo materials for streaming platform conversations

## Done (this session)
- [x] Phase A: Backend API (52+ files, 34 tests, all v1 endpoints)
- [x] Phase A9: GitHub Actions CI pipeline
- [x] Phase B: Supabase Auth + Storage integration
- [x] Phase C: Next.js web app (11 routes)
- [x] Phase D: React Native mobile app (17 screens, native audio recording)
- [x] WebM audio format support
- [x] Deployment config (DEPLOY.md, Dockerfiles, railway.toml)
- [x] Design diagrams in FigJam (5 diagrams)
- [x] Custom /design and /uiux agents
- [x] REG-001, REG-002, REG-003 logged and fixed
