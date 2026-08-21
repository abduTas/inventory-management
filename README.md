# StoreMgr — Store Management App

A mobile-first Next.js store management app with inventory, POS selling, reports (PDF), and PWA push notifications.

## Repository

https://github.com/abduTas/inventory-management

## Setup

### 1. Supabase database

Run the SQL migration in your Supabase SQL Editor:

```
supabase/migrations/001_initial.sql
```

Dashboard: https://supabase.com/dashboard/project/sbtbiycfbmeaqhjkehro/sql

Also in Supabase dashboard:
- **Authentication → Providers → Email**: enabled
- **Confirm email**: disable for development (optional)

### 2. Environment variables

Copy `.env.local` and ensure these are set:

```
NEXT_PUBLIC_SUPABASE_URL=https://sbtbiycfbmeaqhjkehro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_or_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, server admin)
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 4. PWA on Android

1. Deploy to Vercel (HTTPS required)
2. Open the site in Chrome on Android
3. Tap menu → **Install app** or use the in-app prompt
4. Enable push notifications when prompted

## Features

- Phone + password auth (email optional)
- Inventory with low-stock alerts (default threshold: 30)
- POS selling
- Reports with PDF export
- PWA installable on Android
- Web push notifications (free)

## Deploy to Vercel

```bash
npx vercel --prod
```

Set environment variables in Vercel project settings.
