# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev servers (run concurrently)
php artisan serve          # Laravel backend on :8000
npm run dev                # Vite HMR on :5173

# Build
npm run build

# Lint & format frontend
npm run lint               # ESLint with auto-fix
npm run format             # Prettier
npm run types              # TypeScript type check (tsc --noEmit)

# Laravel
php artisan migrate
php artisan migrate:fresh --seed
php artisan octane:start   # Production server (Laravel Octane)
php artisan tinker
```

There are no backend tests in practice. Frontend has no test suite either — verify changes visually.

## Architecture

**Stack:** Laravel 12 + Inertia.js v2 + React 19 + TypeScript + Vite 6 + Tailwind CSS v4.

Inertia acts as the bridge: Laravel controllers call `Inertia::render('PageName', $props)` to render React page components from `resources/js/pages/`. No REST API for page navigation — Inertia handles it as SPA transitions.

**Entry points:**
- `resources/js/app.tsx` — Inertia client setup; also mounts `<PrivacyBanner>`, `<PushSubscribeButton>`, and `<WelcomeModal>` globally on every page.
- `resources/js/ssr.tsx` — SSR entry (Vite SSR build).
- `resources/css/app.css` — global styles, imported in app.tsx.

**Page components** live in `resources/js/pages/`. Each page typically imports Header + Footer + its own CSS file from `resources/css/`.

**The `devocionals` table is shared for three content types**, distinguished by `is_devocional`:
- `1` = Devocional (blog devotionals, `/devocionales`)
- `0` = Estudio bíblico (Bible studies, `/estudios`)
- `2` = Hidden/draft

Enseñanzas (series) are a separate `ensenanzas` table with UUID PKs; individual episodes are `Devocional` rows with `ensenanza_id` set and `serie = 'Series'`.

**API routes** (`routes/api.php`): Likes (`/api/likes/{type}/{id}`), WebPush subscriptions, bulk image upload. The likes system uses an HttpOnly cookie `visitor_id` (set by `AssignVisitorId` middleware) to identify anonymous users across sessions.

**Key controllers:**
- `DevocionalController` — CRUD for devocionals/estudios, view tracking (IP → city via `stevebauman/location`), admin index
- `EnsenanzaController` — series CRUD and episode listing
- `TTSController` — proxies VoiceRSS API, caches MP3s on S3
- `YouTubeController` — fetches YouTube channel videos, filters by "CLASE" in title, cached 30 min
- `PaymentController` — ePayco donation webhook + query

**Styling approach:** Each page/component has its own CSS file in `resources/css/`. Tailwind v4 utilities are used alongside these custom files. Color constants are often defined inline in components (e.g., `BLUE`, `ORANGE`, `CREAM` in FilterSheet). The `ui/` folder has shadcn-style components.

**`useLike` hook** (`resources/js/hooks/useLike.tsx`): optimistic UI, debounced POST, LocalStorage for instant rendering before server response.

**Route notes:**
- `/ensenanzas` → `/series` (301 permanent redirect) — old URLs must keep working
- ngrok support: `AppServiceProvider` forces HTTPS when host contains `ngrok-free.app`
- `/reparar-ciudades` — one-off utility route to backfill city data on DevocionalView records

**Environment variables needed:** `VOICE_RSS_API_KEY`, `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`, AWS S3 credentials, `VITE_APP_URL`, WebPush VAPID keys, ePayco keys.
