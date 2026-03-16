# Deployment Guide

## Prerequisites
- GitHub repo connected to deployment platform
- Supabase project with Auth, Storage, and Postgres configured
- Environment variables ready (see below)

## API Server (Backend)

### Option A: Railway
1. Connect the GitHub repo in Railway dashboard
2. Set root directory to `/` (the API Dockerfile is at the repo root)
3. Set environment variables (see below)
4. Railway auto-detects the Dockerfile and deploys
5. Health check at `GET /health`

### Option B: Render
1. Create a new Web Service from the GitHub repo
2. Set root directory to `/`
3. Build command: `docker build -t api .`
4. Set environment variables
5. Health check path: `/health`

### Option C: Fly.io
```bash
flyctl launch --dockerfile Dockerfile
flyctl secrets set DATABASE_URL=... JWT_SECRET=... SUPABASE_URL=...
flyctl deploy
```

### API Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing (min 8 chars) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `STORAGE_TYPE` | No | `supabase` for production (default: `local`) |
| `SUPABASE_STORAGE_BUCKET` | No | Storage bucket name (default: `story-audio`) |
| `NODE_ENV` | No | `production` for production |
| `PORT` | No | Server port (default: `3000`) |
| `LOG_LEVEL` | No | Logging level (default: `info`) |

## Web App (Frontend)

### Option A: Vercel (recommended)
1. Import the GitHub repo in Vercel dashboard
2. Set root directory to `web/`
3. Framework: Next.js (auto-detected)
4. Set environment variables (see below)
5. Vercel handles build and deployment automatically

### Option B: Docker (Railway/Render/Fly.io)
The web app has a Dockerfile at `web/Dockerfile`. Build args are needed for public env vars:
```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api.railway.app \
  -t web web/
```

### Web Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |

## Post-Deployment Checklist
- [ ] API health check responds at `/health`
- [ ] Web app loads login page
- [ ] Registration creates user in Supabase Auth + artists table
- [ ] Login returns valid session
- [ ] Track creation works
- [ ] Story upload stores file in Supabase Storage
- [ ] Signed URL returns valid audio download link

## CORS Configuration
The API has CORS enabled with `origin: true` (allows all origins). For production, update the CORS config in `src/index.ts` to only allow your web app's domain.
