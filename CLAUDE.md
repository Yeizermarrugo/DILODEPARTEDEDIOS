# CLAUDE.md

Guidance for Claude Code when working in this repository.

---

## Commands

```bash
# Dev servers (run concurrently)
php artisan serve          # Laravel backend → http://localhost:8000
npm run dev                # Vite HMR → http://localhost:5173

# Build
npm run build              # Production build
npm run build:ssr          # SSR build

# Frontend quality
npm run lint               # ESLint with auto-fix
npm run format             # Prettier
npm run types              # TypeScript check (tsc --noEmit)

# Laravel
php artisan migrate
php artisan migrate:fresh --seed
php artisan octane:start   # Production server (Laravel Octane)
php artisan tinker
```

No backend or frontend test suite — verify changes visually in the browser.

---

## Stack

**Laravel 12** + **Inertia.js v2** + **React 19** + **TypeScript** + **Vite 6** + **Tailwind CSS v4**

Inertia bridges backend and frontend: controllers call `Inertia::render('PageName', $props)` and React page components in `resources/js/pages/` render them as SPA transitions. No REST API for page navigation.

### Entry points
| File | Purpose |
|------|---------|
| `resources/js/app.tsx` | Inertia client setup; mounts `<PrivacyBanner>`, `<PushSubscribeButton>`, `<WelcomeModal>` globally |
| `resources/js/ssr.tsx` | SSR entry (Vite SSR build) |
| `resources/css/app.css` | Global Tailwind + base styles |

---

## Database

### Content model: `devocionals` table
A single table serves three content types, distinguished by `is_devocional`:

| Value | Type | URL |
|-------|------|-----|
| `1` | Devocional (daily devotional) | `/devocionales` |
| `0` | Estudio Bíblico (Bible study) | `/estudios` |
| `2` | Episodio de serie (Enseñanza) | `/series/{id}` |

**Series (Enseñanzas):** separate `ensenanzas` table with UUID PKs. Individual episodes are `Devocional` rows with `ensenanza_id` set and `serie = 'Series'`.

### Key models
| Model | Table | Notes |
|-------|-------|-------|
| `Devocional` | `devocionals` | UUID PK; belongs to `Ensenanza`; has `views_count`, `shares_count`, `short_code` |
| `Ensenanza` | `ensenanzas` | UUID PK; has many `Devocional` (episodes); has `short_code` |
| `DevocionalView` | `devocional_views` | Analytics: IP, country, city, browser, platform, timezone |
| `ContentLike` | `content_likes` | Likes for any content type (devocional/estudio/ensenanza) |
| `Donation` | `donations` | ePayco payment records with audit fields |
| `Visitor` | `visitors` | Web push subscribers (visitor_id UUID, HasPushSubscriptions) |
| `PostImage` | `post_images` | Social media post image URLs |
| `User` | `users` | Auth users (Notifiable) |

---

## Routes

### Web (`routes/web.php`)
| Path | Controller | Notes |
|------|-----------|-------|
| `/` | — | Welcome/home page |
| `/devocionales` | `DevocionalController@index` | List with sort/filter/search |
| `/devocional/{id}` | `DevocionalController@details` | Single devotional |
| `/devocionales-search` | — | Search endpoint |
| `/devocionales/{id}/view` | `DevocionalController@trackView` | Analytics tracking |
| `/estudios` | `DevocionalController@estudios` | Bible studies list |
| `/series` | `EnsenanzaController@index` | Teaching series |
| `/series/{id}` | `EnsenanzaController@details` | Single series |
| `/series-search` | — | Series search |
| `/ensenanzas` → `/series` | — | **301 permanent redirect** — keep working |
| `/podcast` | — | Podcast page |
| `/recursos` | — | Resource library (Librería) |
| `/obras` | — | Works/projects |
| `/youtube/latest` | `YouTubeController@latestVideos` | YouTube feed (cached 30 min) |
| `/recaudo/confirmacion` | `PaymentController@confirmation` | ePayco webhook |
| `/gracias` | — | Post-donation thanks page |
| `/devocionales-edit` | — | Admin edit index (auth required) |
| `/post-images` | — | Post image management (auth required) |
| `/reparar-ciudades` | — | One-off utility: backfill city data in DevocionalView |
| `/content-usage` | — | Legal/content usage page |
| `/{code}` | `ShortUrlController@redirect` | Short URL redirect (8 chars alfanuméricos); registrada **al final** de web.php para no interceptar rutas reales como `/register` |

Auth routes in `routes/auth.php`; settings routes in `routes/settings.php`.

### API (`routes/api.php`)
| Endpoint | Purpose |
|---------|---------|
| `GET/POST /api/likes/{type}/{id}` | Get or toggle like; `type` = devocional / estudio / ensenanza |
| `GET /api/short-url/{type}/{id}` | Get or generate short URL for content (lazy: creates `short_code` on first call) |
| `POST /api/share/{type}/{id}` | Increment `shares_count` (called only on confirmed share/clipboard copy) |
| `POST /api/push/subscribe` | Register device for web push |
| `POST /api/push/unsubscribe` | Unregister device |
| `GET /api/push/vapid-key` | Get VAPID public key |
| `GET/POST /api/tts` | Generate TTS audio (VoiceRSS) |
| `GET /api/tts/voices` | Available TTS voices (ES-MX, ES-ES) |
| `GET/POST /api/series` | Series list/create/update |
| `POST /api/bulk-upload` | Bulk upload images to S3 |
| `POST /api/bulk-upload/video` | Bulk upload videos to S3 |
| `GET /api/bucket/images` | List all images in S3 bucket |

---

## Controllers

| Controller | Responsibility |
|-----------|---------------|
| `DevocionalController` | CRUD devocionals/estudios; view tracking via `stevebauman/location` (IP → city); admin index |
| `EnsenanzaController` | Series CRUD; episode listing; `listSimple()` for API dropdown |
| `YouTubeController` | Fetch channel videos, filter by "CLASE" in title, cached 30 min |
| `PaymentController` | ePayco webhook: validate signatures, store `Donation` records |
| `TTSController` | Proxy VoiceRSS API; cache MP3s on S3 |
| `LikeController` | `show()` like counts; `toggle()` like/unlike |
| `ShortUrlController` | `redirect()` short URL → 302; `getOrCreate()` genera/devuelve short code; `trackShare()` incrementa `shares_count` |
| `ImageUploadController` | Upload devotional + post images to S3 |
| `PdfUploadController` | Upload PDFs to S3 (10 MB max) |
| `BulkUploadController` | Bulk S3 image/video uploads; list bucket contents |
| `PushSubscriptionController` | Web push subscribe/unsubscribe/vapid-key |
| `PostController` | Recent post images list + delete |

---

## Frontend

### Pages (`resources/js/pages/`)
| Page | Route | Notes |
|------|-------|-------|
| `welcome.tsx` | `/` | Hero, featured content |
| `Devocionals.tsx` | `/devocionales` | Filters, search, sort (latest/likes/views/shares) |
| `DevocionalDetailsPage.tsx` | `/devocional/{id}`, `/estudio-biblico/{id}`, `/series/{id}` | Inertia page for all content types; includes TTS, likes, share, view tracking |
| `DevocionalDetails.tsx` | — | Componente embebido (no es página Inertia directa) |
| `DevocionalesForm.tsx` | create/edit | Auth required; `mode` prop toggles create vs edit |
| `Estudios.tsx` | `/estudios` | Bible studies listing |
| `Enseñanzas.tsx` | `/series` | Teaching series listing |
| `Podcast.tsx` | `/podcast` | Podcast content |
| `Libreria.tsx` | `/recursos` | Resource library |
| `Obras.tsx` | `/obras` | Works listing |
| `PostImage.tsx` | `/post-images` | Auth-only image management |
| `PaginaLegal.tsx` | `/content-usage` | Legal terms |
| `ThanksPage.tsx` | `/gracias` | Post-donation confirmation |
| `Offline.tsx` | — | Service worker offline fallback |
| `dashboard.tsx` | `/dashboard` | Auth user dashboard |

### Key components (`resources/js/components/`)
| Component | Purpose |
|-----------|---------|
| `DevocionalCard.tsx` | Content card for devotional preview |
| `EnsenanzaCard.tsx` | Card for teaching series |
| `CoverflowCarousel.tsx` | 3D coverflow-style carousel |
| `FilterBar.tsx` | Filter/search bar |
| `TextToSpeechButton.tsx` / `TextToSpeechAudioPlayer.tsx` | TTS trigger + player |
| `LikeButton.tsx` | Like/dislike with animation |
| `ShareButton.tsx` | Compartir vía Web Share API (sheet nativo) o clipboard; muestra "¡Copiado!" y conteo en variant `default`; sin conteo en `compact` (usado en cards) |
| `CardNew.tsx` | Card principal de contenido; incluye LikeButton + ShareButton (compact) |
| `PushSubscribeButton.tsx` | Web push opt-in (mounted globally in `app.tsx`) |
| `ImageUpload.tsx` | Upload with preview |
| `Paginator.tsx` | Pagination controls |
| `PageHero.tsx` | Hero banner |
| `LoaderBook.tsx` / `Spinner.tsx` | Loading states |
| `ui/*` | shadcn-style primitives (dialog, sheet, badge, button, select, etc.) |
| `dashboard/Devocionales.tsx` | Admin devocional panel |

### Hooks (`resources/js/hooks/`)
| Hook | Purpose |
|------|---------|
| `useLike.tsx` | Optimistic like toggle; debounced POST; LocalStorage for instant render |
| `useShareUrl.tsx` | Obtiene/genera short URL lazy (cachea en localStorage); llama Web Share API con texto dinámico según tipo; fallback clipboard; registra share en API solo en share confirmado |
| `use-appearance.tsx` | Dark/light/system theme management |
| `use-mobile.tsx` | Mobile viewport detection |
| `use-mobile-navigation.ts` | Mobile nav open/close state |
| `use-initials.tsx` | Extract initials from user name |

### Styling
Each page has its own CSS file in `resources/css/` (e.g., `devocionals.css`, `devocionalDetails.css`). Tailwind v4 utilities are used alongside these custom files.

Color constants (e.g., `BLUE`, `ORANGE`, `CREAM`) are sometimes defined inline in components like `FilterSheet`.

The `ui/` folder follows shadcn component conventions.

---

## Middleware

| Middleware | Purpose |
|-----------|---------|
| `HandleInertiaRequests` | Shares app name, random quote, auth state, Ziggy routes, sidebar state to all Inertia responses |
| `AssignVisitorId` | Sets `visitor_id` UUID cookie (HttpOnly, 1-year TTL) for anonymous user tracking (likes, views) |
| `HandleAppearance` | Reads `appearance` cookie (dark/light/system) and passes to views |

---

## Infrastructure & Services

### Storage
All file uploads (images, PDFs, videos) go to **AWS S3** via `flysystem-aws-s3-v3`.

### Visitor identification
`AssignVisitorId` middleware assigns an HttpOnly `visitor_id` UUID cookie (1-year). Used by the likes system and view analytics to identify anonymous users across sessions.

### Web Push Notifications
Visitors opt in via `<PushSubscribeButton>` (mounted globally). Push subscriptions stored in `push_subscriptions` table linked to `Visitor`. VAPID keys required.

### Text-to-Speech
`TTSController` proxies the VoiceRSS API and caches generated MP3s on S3.

### Payments
`PaymentController` handles ePayco donation webhooks — validates signatures, stores `Donation` records including audit fields and raw response.

### ngrok support
`AppServiceProvider::boot()` forces HTTPS scheme when the host contains `ngrok-free.app`.

---

## Environment Variables

| Variable | Purpose |
|---------|---------|
| `VOICE_RSS_API_KEY` | VoiceRSS TTS API |
| `YOUTUBE_API_KEY` | YouTube Data API v3 |
| `YOUTUBE_CHANNEL_ID` | Channel to fetch videos from |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_DEFAULT_REGION` / `AWS_BUCKET` | S3 storage |
| `VITE_APP_URL` | Frontend base URL |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web push notifications |
| `EPAYCO_CUSTOMER_ID` / `EPAYCO_P_KEY` / `EPAYCO_PUBLIC_KEY` | ePayco donations |
