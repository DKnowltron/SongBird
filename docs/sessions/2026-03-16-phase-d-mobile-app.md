# 2026-03-16 — Phase D: React Native Mobile App

## Context
Phases A-C complete. Web app tested and working. Design diagrams created in FigJam covering navigation structure, user flows, screen inventory, and story lifecycle.

## Goals
- React Native (Expo) project scaffold
- 5-tab bottom navigation: Home, Tracks, Record, Notifications, Profile
- Auth flow (Supabase — email/password, Google, Apple)
- Native audio recording with expo-av
- All screens from the screen inventory (17 total)
- Consistent design language with web app

## Design Decisions
- **DEC-014**: React Native with Expo over Flutter (TypeScript consistency across stack)
- **5 bottom tabs**: Home, Tracks, Record (hero), Notifications, Profile
- **Record is center tab**: Prominent, always accessible in 1 tap
- **Recording flow**: Select track → record → review playback → save as draft
- **Admin screens under Profile**: Moderation + Partners tucked under settings for admin users

## What was built

### FigJam Design Diagrams (5 total)
- Navigation structure (tab bar → stack screens)
- Artist recording flow (select → record → review → publish → verify → distribute)
- Auth & onboarding flow (welcome → login/register → onboarding → dashboard)
- Screen inventory with API data sources (17 screens mapped to endpoints)
- Story lifecycle state machine (draft → published → verified → distributed)

### Expo Project Scaffold
- React Native with Expo SDK 55, TypeScript, Expo Router (file-based routing)
- Lives in `mobile/` directory (monorepo: backend at root, web in `web/`, mobile in `mobile/`)
- Supabase JS client configured with AsyncStorage for session persistence
- API client shared pattern with web app
- Auth context provider (same pattern as web)
- Theme system matching web app colors (primary indigo, success green, warning amber, destructive red)

### Screens (17 total)
**Auth:**
- Login (email/password)
- Register (name/email/password)

**Tab Screens:**
- Dashboard (stat cards — total tracks, stories by status, distributed)
- Tracks list (FlatList with status badges, pull-to-refresh)
- Record tab (hero record button, navigates to track selection)
- Notifications (list with unread dots, mark-as-read)
- Profile (avatar, name, admin menu, sign out)

**Stack Screens:**
- Track detail (story list with publish/verify/delete actions, record button)
- Select track for recording (searchable list)
- Recording screen (expo-av capture, timer, playback, transcript input, haptic feedback)
- Admin: Moderation queue (approve/reject)
- Admin: Partners list

### Mobile-Specific Features
- Native audio recording via expo-av (HIGH_QUALITY preset)
- Haptic feedback on record start/stop and story save (expo-haptics)
- Pull-to-refresh on all list screens
- KeyboardAvoidingView on auth screens
- Alert.alert for destructive confirmations (sign out, delete story)
- Microphone permission request with clear explanation

## Regressions found
None during this session.

## PRs
- Pending — branch `feature/mobile-app`

## Learnings
- Expo Router v4 uses file-based routing similar to Next.js App Router. `(tabs)` directory creates bottom tab navigation automatically.
- expo-av Recording outputs m4a (AAC) on iOS and 3gp on Android by default with HIGH_QUALITY preset. The backend already accepts audio/mp4 (m4a).
- FormData in React Native requires the file object to have `uri`, `name`, and `type` fields — different from web FormData where you pass a Blob.

## Open items
- Test on physical iOS/Android device (requires Expo Go app)
- Google/Apple OAuth on mobile (needs native configuration in app.json)
- Push notifications (expo-notifications)
- Offline support (draft recordings saved locally)
