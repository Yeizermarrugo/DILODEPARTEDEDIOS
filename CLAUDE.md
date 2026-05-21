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
php artisan pint           # Laravel code formatter

# Scheduled commands (run by cron/scheduler)
php artisan devocional:notificar-diario      # Send push notification for today's content
php artisan contenido:publicar-programado    # Publish scheduled hidden content + email notify
```

No backend or frontend test suite — verify changes visually in the browser.

---

## Stack

**Laravel 12** + **Inertia.js v2** + **React 19** + **TypeScript 5.7** + **Vite 6** + **Tailwind CSS v4** + **MUI 7**

Inertia bridges backend and frontend: controllers call `Inertia::render('PageName', $props)` and React page components in `resources/js/pages/` render them as SPA transitions. No REST API for page navigation.

### Notable frontend libraries
| Library | Version | Use |
|---------|---------|-----|
| `@inertiajs/react` | 2.0 | SPA routing bridge |
| `@mui/material` | 7.2 | Material UI components |
| `@radix-ui/*` | various | Headless UI primitives |
| `@tinymce/tinymce-react` | 6.2 | Rich text editor for content |
| `dompurify` | 3.4 | Client-side HTML sanitization |
| `lucide-react` | 0.475 | Icon set |
| `axios` | 1.10 | HTTP client |
| `react-router-dom` | 7.7 | Client routing |

### Notable PHP packages
| Package | Purpose |
|---------|---------|
| `laravel/octane` | High-performance app server |
| `tightenco/ziggy` | Use Laravel named routes in JS |
| `inertiajs/inertia-laravel` | Inertia server adapter |
| `laravel-notification-channels/webpush` | Web push via VAPID |
| `resend/resend-laravel` | Transactional email (Resend) |
| `stevebauman/location` | IP → geolocation |
| `jenssegers/agent` | User-agent parser (browser/platform) |
| `ezyang/htmlpurifier` | Server-side HTML sanitization |
| `league/flysystem-aws-s3-v3` | S3 file storage |

### Entry points
| File | Purpose |
|------|---------|
| `resources/js/app.tsx` | Inertia client setup; mounts `<PrivacyBanner>`, `<PushSubscribeButton>` globally |
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

### Models

#### `Devocional` → `devocionals`
- **PK:** UUID string (auto-generated via `Str::uuid()`)
- **Fillable:** `contenido`, `imagen`, `categoria`, `autor`, `is_devocional`, `serie`, `created_at`, `ensenanza_id`, `pdf`, `instagram`, `tiktok`, `notificado_at`, `short_code`, `shares_count`
- **Casts:** `is_devocional` → int, `created_at` → datetime
- **Relationships:** `ensenanza()` → belongsTo Ensenanza
- **Scopes:** `scopeSoloEnsenanzas()` → where serie='Series' AND is_devocional IN [1,2]
- **Key columns:** `views_count`, `shares_count`, `short_code` (8-char alphanumeric), `notificado_at`

#### `Ensenanza` → `ensenanzas`
- **PK:** UUID string
- **Fillable:** `slug`, `titulo`, `descripcion`, `imagen`, `short_code`, `shares_count`
- **Relationships:** `devocionales()` → hasMany Devocional
- **Note:** `slug` is unique; auto-generated on create

#### `DevocionalView` → `devocional_views`
- **Fillable:** `devocional_id`, `ip_address`, `country`, `browser`, `platform`, `accepted_terms`, `local_time`
- **Casts:** `created_at`, `updated_at` → datetime
- **Purpose:** Anonymous analytics per view. IP last octet anonymized to `.0` before storage. Index on `(devocional_id, ip_address, created_at)`. Throttled: 1 view per IP per hour per content.

#### `ContentLike` → `content_likes`
- **Fillable:** `content_id`, `content_type`, `visitor_hash`, `ip_segment`, `created_at`
- **Timestamps:** false
- **Constants:** `TYPE_DEVOCIONAL='devocional'`, `TYPE_ESTUDIO='estudio'`, `TYPE_ENSENANZA='ensenanza'`
- **Scopes:** `scopeForContent($query, string $type, string $id)`
- **Unique:** `(content_id, content_type, visitor_hash)` — one like per visitor per content
- **visitor_hash:** SHA256(visitor_uuid|content_id|content_type) — no PII stored

#### `ContactMessage` → `contact_messages`
- **Fillable:** `name`, `email`, `whatsapp`, `subject`, `body`, `read_at`, `archived_at`
- **Casts:** `read_at`, `archived_at` → datetime
- **Scopes:** `scopeUnread()` → whereNull('read_at')
- **Dashboard query:** filters `whereNull('archived_at')`, latest 50

#### `Donation` → `donations`
- **Fillable:** `ref_payco`, `transaction_id`, `amount`, `currency`, `status`, `description`, `bank_name`, `receipt_number`, `ip_address`, `customer_name`, `customer_email`, `customer_phone`, `raw_response`, `ref_payco_hash`
- **Casts:** `amount` → decimal:2, `raw_response` → array
- **Status values:** `Aceptada` | `Rechazada` | `Pendiente` | `Fallida` | `Reversada`
- **Purpose:** Full ePayco webhook audit trail; `raw_response` stores complete gateway response

#### `Visitor` → `visitors`
- **Fillable:** `visitor_id`
- **Traits:** `Notifiable`, `HasPushSubscriptions`
- **Purpose:** Web push subscriber registry. `visitor_id` is SHA256-hashed UUID — no raw UUID stored.

#### `PostImage` → `post_images`
- **Fillable:** `url`
- **Purpose:** S3 URLs for social media post images

#### `User` → `users`
- **Fillable:** `name`, `email`, `password`
- **Casts:** `email_verified_at` → datetime, `password` → hashed

---

## Routes

### Web (`routes/web.php`)

| Method | Path | Handler | Auth | Notes |
|--------|------|---------|------|-------|
| GET | `/` | Inertia 'welcome' | — | Home/hero |
| GET | `/dashboard` | Inline closure | ✓ | Stats, recientes, contactMessages |
| GET | `/about` | Inertia 'About' | — | |
| GET | `/contacto` | Inertia 'Contacto' | — | Contact form page |
| GET | `/devocionales` | Inertia 'Devocionals' | — | |
| GET | `/devocionales-search` | `DevocionalController@index` | — | `?sort`, `?search`, `?per_page` |
| GET | `/devocionales-searchCategories` | `DevocionalController@searchCategories` | — | |
| GET | `/devocionales/categoria/{categoria}` | `DevocionalController@porCategoria` | — | |
| GET | `/devocional/{id}` | `DevocionalController@details` | — | name: `devocional.details` |
| GET | `/estudio-biblico/{id}` | `DevocionalController@details` | — | name: `estudio-biblico.details` |
| POST | `/devocionales/{id}/view` | `DevocionalController@trackView` | — | throttle 20/1min |
| POST | `/privacy/accept` | `DevocionalController@acceptPrivacy` | — | |
| GET | `/devocionals-latest` | `DevocionalController@latest` | — | JSON, last 5 |
| GET | `/estudios` | Inertia 'Estudios' | — | |
| GET | `/estudiosbiblicos` | `DevocionalController@estudios` | — | JSON, cached 1h |
| GET | `/series` | Inertia 'Enseñanzas' | — | |
| GET | `/series-search` | `EnsenanzaController@index` | — | name: `ensenanza-search` |
| GET | `/series/{id}` | `EnsenanzaController@details` | — | name: `ensenanza.details` |
| GET | `/podcast` | Inertia 'Podcast' | — | |
| GET | `/recursos` | Inertia 'Libreria' | — | Resource library |
| GET | `/obras` | Inertia 'Obras' | — | |
| GET | `/content-usage` | Inertia 'PaginaLegal' | — | |
| GET | `/youtube/latest` | `YouTubeController@latestVideos` | — | cached 30min |
| POST | `/recaudo/confirmacion` | `PaymentController@confirmation` | — | ePayco webhook; name: `epayco.confirmation` |
| GET | `/gracias` | Inertia 'ThanksPage' | — | name: `payment.thanks` |
| GET | `/devocionalesAgregar` | Inertia 'DevocionalesForm' create | ✓ | |
| GET | `/devocionales-editar/{id}` | Inertia 'DevocionalesForm' edit | ✓ | |
| POST | `/devocionalesadd` | `DevocionalController@store` | ✓ | |
| PUT | `/devocionales/{id}` | `DevocionalController@update` | ✓ | |
| GET | `/devocionales/{id}` | `DevocionalController@showJson` | ✓ | JSON for admin edit |
| GET | `/devocionales-edit` | `DevocionalController@adminIndex` | ✓ | Admin panel |
| POST | `/upload-image` | `ImageUploadController@store` | ✓ | S3, returns URL |
| POST | `/upload-post-image` | `ImageUploadController@post` | ✓ | S3 + DB record |
| POST | `/upload-pdf` | `PdfUploadController@store` | ✓ | S3, 10MB max |
| GET | `/postImage` | Inertia 'PostImage' | ✓ | |
| GET | `/storage-cleanup` | `StorageCleanupController@index` | ✓ | Orphaned file manager |
| DELETE | `/storage-cleanup` | `StorageCleanupController@destroy` | ✓ | Delete S3 paths |
| GET | `/post-images` | `PostController@index` | — | JSON list |
| DELETE | `/post-image/{id}` | `PostController@delete` | ✓ | |
| PATCH | `/contact-messages/{id}/read` | `ContactController@markRead` | ✓ | Sets read_at if null |
| PATCH | `/contact-messages/{id}/archive` | `ContactController@archive` | ✓ | Sets archived_at |
| GET | `/reparar-ciudades` | Inline utility | — | One-off: backfill city in DevocionalView |
| GET | `/{code}` | `ShortUrlController@redirect` | — | 8-char alphanumeric; **last route** |

Auth routes in `routes/auth.php`; settings routes in `routes/settings.php`.

### API (`routes/api.php`)

| Method | Endpoint | Auth | Notes |
|--------|---------|------|-------|
| GET | `/api/likes/{type}/{id}` | — | Like count + current visitor state |
| POST | `/api/likes/{type}/{id}` | — | Toggle like |
| GET | `/api/short-url/{type}/{id}` | — | Get/create short code; throttle 30/1 |
| POST | `/api/share/{type}/{id}` | — | Increment shares_count; throttle 20/1 |
| POST | `/api/push/subscribe` | — | Register push subscription |
| POST | `/api/push/unsubscribe` | — | Delete push subscription |
| GET | `/api/push/vapid-key` | — | Public VAPID key |
| GET | `/api/tts` | — | Generate TTS MP3 (VoiceRSS proxy) |
| GET | `/api/tts/voices` | — | Available voices by language |
| GET | `/api/series` | ✓ | Simple list (id, titulo) for dropdowns |
| POST | `/api/series` | ✓ | Create series |
| PUT | `/api/series/{id}` | ✓ | Update series |
| POST | `/api/bulk-upload` | ✓ | Bulk image upload to S3 |
| POST | `/api/bulk-upload/video` | ✓ | Bulk video upload to S3 (200MB max) |
| GET | `/api/bucket/images` | ✓ | List images in S3 'imagenes' folder |
| POST | `/api/contact` | — | Submit contact form; throttle 5/1 |

---

## Controllers

| Controller | Key Methods |
|-----------|------------|
| `DevocionalController` | `index()` list+filter, `details($id)` Inertia page, `store()` create+purify, `update()` edit+purify, `trackView()` analytics, `estudios()` JSON, `adminIndex()` admin panel, `showJson($id)` |
| `EnsenanzaController` | `index()` list with episodes, `details($id)` Inertia page, `listSimple()` dropdown list, `store()` create, `update()` edit |
| `ContactController` | `store()` save+email, `index()` paginated list, `markRead($id)` set read_at if null, `archive($id)` set archived_at, `unreadCount()` |
| `LikeController` | `show()` count+state, `toggle()` like/unlike (visitor_hash, IP anonymization) |
| `ShortUrlController` | `redirect($code)` → 302, `getOrCreate()` lazy generate, `trackShare()` increment shares |
| `TTSController` | `voiceRss()` proxy VoiceRSS→cache MP3, `voices()` list voices |
| `YouTubeController` | `latestVideos()` fetch+filter by "CLASE"+cache 30min |
| `PaymentController` | `confirmation()` ePayco webhook: validate signature, upsert Donation |
| `ImageUploadController` | `store()` → S3 'imagenes' (env-prefixed), `post()` → S3 'postCard' (env-prefixed) + PostImage record. Both set `CacheControl: max-age=31536000`. Uses `UsesStoragePrefix` trait. |
| `BulkUploadController` | `store()` images, `storeVideo()` video, `index()` list S3 bucket. Uses `UsesStoragePrefix` trait. |
| `PushSubscriptionController` | `subscribe()`, `unsubscribe()`, `vapidKey()` |
| `PostController` | `index()` list, `delete($id)` remove |
| `PdfUploadController` | `store()` → S3 'pdf' (env-prefixed), 10MB max. Uses `UsesStoragePrefix` trait. |
| `StorageCleanupController` | `index()` Inertia page with orphaned file list, `destroy()` delete paths from S3. Scans env-prefixed folders, compares against 5 sources to find orphans (see implementation details). Path security validation on delete. |
| `SitemapController` | Generates XML sitemap |

### Key implementation details
- **HTML sanitization:** `DevocionalController` runs `HTMLPurifier` on `contenido` before store/update. `DOMPurify` also used client-side before TinyMCE renders.
- **View tracking:** IP anonymized (last octet → `.0`). Throttled 1 view/IP/hour via DB index. Browser+platform detected via `jenssegers/agent`. Dispatched via `TrackDevocionalView` job.
- **Like hashing:** `visitor_hash = SHA256(visitor_uuid + "|" + content_id + "|" + content_type)` — no PII in DB.
- **Short URLs:** 8-char alphanumeric codes stored on `devocionals.short_code` and `ensenanzas.short_code`. Lazy-generated on first share via `ShortCodeService`.
- **Cache keys:** `dashboard.stats` (5min), `dashboard.recientes` (2min), `devocionales.categorias` (1h), `devocionales.autores` (1h), `estudios.all` (1h), `youtube.latest_videos` (30min).
- **Storage env prefix:** Upload controllers use `UsesStoragePrefix` trait. `StorageCleanupController` inlines `storageFolder()` directly (avoids intelephense false-positive on trait detection). `storageFolder($base)` returns `local/$base` when `APP_ENV != production`, or `$base` in production. Prevents local dev uploads from appearing as orphans in prod cleanup.
- **Storage cleanup orphan detection — 5 sources:** `devocionals.imagen`, `devocionals.pdf`, `ensenanzas.imagen`, `post_images.url`, and URLs extracted via regex from `devocionals.contenido` HTML (catches images/videos embedded by TinyMCE). Comparison uses path, not full URL (strips `AWS_URL` prefix → robust if domain changes). Delete validates each path starts with a known env-prefixed folder — rejects arbitrary paths. Frontend uses `router.delete()` from Inertia (auto-handles CSRF, avoids 419).
- **S3 CacheControl:** All image uploads set `CacheControl: max-age=31536000, public` on the S3 object. Combined with Cloudflare R2 edge caching this gives 1-year browser+CDN cache.
- **Content visibility:** `hidden` boolean on `devocionals`. `PublicarContenidoProgramado` command unhides content scheduled for today and sends email. `NotificarDevocionalDiario` command sends push notifications for today's content.

---

## Frontend

### Pages (`resources/js/pages/`)

| Page | Route | Notes |
|------|-------|-------|
| `welcome.tsx` | `/` | Hero, featured content, YouTube latest |
| `About.tsx` | `/about` | About page |
| `Contacto.tsx` | `/contacto` | Contact form (posts to `/api/contact`) |
| `Devocionals.tsx` | `/devocionales` | Filters, search, sort (latest/likes/views/shares), pagination |
| `DevocionalDetailsPage.tsx` | `/devocional/{id}`, `/estudio-biblico/{id}` | Full detail with TTS, likes, share, view tracking, meta SEO |
| `DevocionalDetails.tsx` | — | Embedded component (not a direct Inertia page) |
| `DevocionalesForm.tsx` | create/edit | Auth required; `mode` prop = 'create' \| 'edit'; TinyMCE editor |
| `Edit.tsx` | `/devocionales-edit` | Admin panel; separate pagination for devocionals/estudios/hidden |
| `Estudios.tsx` | `/estudios` | Bible studies listing |
| `Enseñanzas.tsx` | `/series` | Teaching series listing |
| `Podcast.tsx` | `/podcast` | Podcast content |
| `Libreria.tsx` | `/recursos` | Resource library |
| `Obras.tsx` | `/obras` | Works listing |
| `PostImage.tsx` | `/postImage` | Auth-only bulk image upload + management |
| `StorageCleanup.tsx` | `/storage-cleanup` | Auth-only orphaned S3 file viewer + bulk delete |
| `PaginaLegal.tsx` | `/content-usage` | Legal/content usage terms |
| `ThanksPage.tsx` | `/gracias` | Post-donation confirmation |
| `Offline.tsx` | — | Service worker offline fallback |
| `dashboard.tsx` | `/dashboard` | Auth dashboard: stats, recientes, MessagesPanel |
| `auth/login.tsx` | `/login` | Login form |
| `auth/register.tsx` | `/register` | Registration (redirects to login, no auto-login) |
| `settings/appearance.tsx` | `/settings/appearance` | Dark/light/system theme |
| `settings/profile.tsx` | `/settings/profile` | Name, email, delete account |
| `settings/password.tsx` | `/settings/password` | Change password |

### Key components (`resources/js/components/`)

| Component | Purpose |
|-----------|---------|
| `DevocionalCard.tsx` | Content card for devotional preview with category color mapping |
| `EnsenanzaCard.tsx` | Card for teaching series with expandable episode list |
| `CardNew.tsx` | Main content card; includes LikeButton + ShareButton (compact) |
| `CoverflowCarousel.tsx` | 3D coverflow-style carousel |
| `FilterBar.tsx` | Filter/search bar |
| `TextToSpeechButton.tsx` | TTS trigger button |
| `TextToSpeechAudioPlayer.tsx` | TTS audio player UI |
| `LikeButton.tsx` | Heart icon like with flying-heart animation; props: `type`, `id`, `variant ('default'\|'compact')` |
| `ShareButton.tsx` | Web Share API with clipboard fallback; `variant='default'` shows count, `'compact'` hides it |
| `PushSubscribeButton.tsx` | Web push opt-in (mounted globally in `app.tsx`) |
| `PrivacyBanner.tsx` | Privacy consent banner (mounted globally) |
| `PullToRefresh.tsx` | Mobile pull-to-refresh gesture |
| `ImageUpload.tsx` | File input with S3 upload + preview |
| `Paginator.tsx` | Pagination controls |
| `PageHero.tsx` | Hero banner |
| `PageLayout.tsx` | Layout wrapper |
| `Header.tsx` / `Footer.tsx` | Public navigation and footer |
| `app-shell.tsx` / `app-sidebar.tsx` / `app-header.tsx` | Auth layout (sidebar, breadcrumbs) |
| `LoaderBook.tsx` / `Spinner.tsx` | Loading states |
| `ui/*` | shadcn/Radix primitives: dialog, sheet, badge, button, select, collapsible, navigation-menu, sidebar, etc. |
| `ui/FilterSheet.tsx` | Mobile filter sheet overlay |
| `dashboard/Devocionales.tsx` | Admin devocional management panel |
| `dashboard/DevocionalesEdit.tsx` | Edit form within admin panel |
| `dashboard/Post.tsx` | Post image management panel |
| `main.tsx` | Hero/home page main content section |
| `LibroList.tsx` | Book list for Libreria page |
| `ObrasList.tsx` | Works list for Obras page |

### Hooks (`resources/js/hooks/`)

| Hook | Returns | Notes |
|------|---------|-------|
| `useLike.tsx` | `{ liked, total, loading, toggle }` | Optimistic update; debounced POST 300ms; localStorage cache; type: `'devocional'\|'estudio'\|'ensenanza'` |
| `useShareUrl.tsx` | `{ loading, copied, sharesCount, share }` | Lazy short URL; Web Share API → clipboard fallback; only counts confirmed shares |
| `useImagePreload.tsx` | — | Preloads image URLs for smoother UX |
| `use-appearance.tsx` | theme state | Dark/light/system via cookie |
| `use-mobile.tsx` | `boolean` | Mobile breakpoint detection |
| `use-mobile-navigation.ts` | nav state | Mobile nav open/close |
| `use-initials.tsx` | `string` | Extract initials from user name |

### Styling

Each page has its own CSS file in `resources/css/` (e.g., `devocionals.css`, `devocionalDetails.css`, `contacto.css`, `libreria.css`). Tailwind v4 utilities used alongside custom CSS.

Color palette used across components: `#2d465e` (dark blue), `#f75815` (orange), `#faf8f4` (cream), `#f5f0e8` (warm bg). Sometimes defined as inline constants in components.

`ui/` folder follows shadcn component conventions (copy-paste, not installed as dependency).

---

## Middleware

| Middleware | Purpose |
|-----------|---------|
| `HandleInertiaRequests` | Shares `name`, `quote` (cached daily), `auth`, `ziggy`, `sidebarOpen` to all Inertia responses |
| `AssignVisitorId` | Sets HttpOnly `visitor_id` UUID cookie (1-year TTL) — used for likes and view analytics |
| `HandleAppearance` | Reads `appearance` cookie (default 'system'); passed to views for SSR theme |
| `AddSecurityHeaders` | Sets CSP (whitelist: TinyMCE, Instagram, ePayco, YouTube), `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` |

---

## Infrastructure & Services

### Storage
All uploads (images, PDFs, videos) go to **Cloudflare R2** (S3-compatible, zero egress cost) via `flysystem-aws-s3-v3`. Hosted via Laravel Cloud Object Storage — credentials use `AWS_ENDPOINT` pointing to `r2.cloudflarestorage.com`. `AWS_URL` is the public-facing CDN URL (`*.laravel.cloud` domain, Cloudflare-backed edge).

**Folder structure (env-prefixed via `UsesStoragePrefix` trait):**
| Env | imagenes | postCard | pdf | videos |
|-----|----------|----------|-----|--------|
| production | `imagenes/` | `postCard/` | `pdf/` | `videos/` |
| local/staging | `local/imagenes/` | `local/postCard/` | `local/pdf/` | `local/videos/` |

This prevents local dev uploads from appearing as orphans in the production storage cleanup tool.

All image uploads set `CacheControl: max-age=31536000, public` → 1-year CDN cache at Cloudflare edge.

### Visitor identification
`AssignVisitorId` sets HttpOnly `visitor_id` UUID cookie (1 year). The raw UUID is never stored in DB — only SHA256 hashes are stored (`visitors.visitor_id`, `content_likes.visitor_hash`).

### Web Push Notifications
Visitors opt in via `<PushSubscribeButton>` (globally mounted). Subscriptions stored in `push_subscriptions` table linked to `Visitor`. Requires VAPID keys.

### Text-to-Speech
`TTSController` proxies Voice RSS API. Supported: `es-mx` (voices: Juana, Silvia, Teresa, Jose) and `es-es` (Jorge, Francisco, Mia, Sofia). Generated MP3s cached on public disk.

### Payments
`PaymentController@confirmation` handles ePayco webhook: validates SHA256 signature, upserts `Donation` record with full `raw_response` JSON.

### Transactional Email
Resend via `resend/resend-laravel`. Contact form sends `ContactFormMail` to `dilodepartededios@gmail.com`. Subject format: `[Contacto] {subject} — {name}`.

### Rich Text Editing
TinyMCE 6 (self-hosted via CDN, key from `config/services.php`). Content sanitized with HTMLPurifier (PHP) on store/update. Client-side DOMPurify used before rendering untrusted HTML.

### ngrok support
`AppServiceProvider::boot()` calls `URL::forceScheme('https')` when `config('app.url')` contains `ngrok-free.app`.

### Traits
| Trait | Location | Purpose |
|-------|----------|---------|
| `UsesStoragePrefix` | `app/Traits/UsesStoragePrefix.php` | `storageFolder(string $base): string` — prefixes S3 folder with `local/` when not in production |

### Jobs
| Job | Purpose |
|-----|---------|
| `TrackDevocionalView` | Queued job to record a page view asynchronously |

### Services
| Service | Purpose |
|---------|---------|
| `ShortCodeService` | Generates unique 8-char alphanumeric short codes for devocionals/ensenanzas |

### Rules
| Rule | Purpose |
|------|---------|
| `ValidImageContent` | Custom validation rule: verifies uploaded file is a real image (not just extension) |

### Console Commands
| Command | Signature | Purpose |
|---------|-----------|---------|
| `NotificarDevocionalDiario` | `devocional:notificar-diario` | Sends push notification to all subscribers for today's published content |
| `PublicarContenidoProgramado` | `contenido:publicar-programado` | Unhides content with `hidden=true` scheduled for today, sends email to `dilodepartededios@gmail.com` |

### Notifications / Mail
| Class | Purpose |
|-------|---------|
| `NuevoContenidoNotification` | Web push notification payload for new content |
| `ContactFormMail` | Email sent to admin on contact form submission |
| `ContenidoPublicadoMail` | Email notification when scheduled content is published |

---

## Environment Variables

| Variable | Purpose |
|---------|---------|
| `APP_NAME` | Application name (shared to frontend via Inertia) |
| `APP_URL` | Backend base URL |
| `VITE_APP_URL` | Frontend base URL |
| `DB_*` | Database connection |
| `RESEND_KEY` | Resend transactional email API key |
| `VOICE_RSS_API_KEY` | Voice RSS TTS API |
| `YOUTUBE_API_KEY` | YouTube Data API v3 |
| `YOUTUBE_CHANNEL_ID` | Channel to fetch videos from |
| `AWS_ACCESS_KEY_ID` | S3 credentials |
| `AWS_SECRET_ACCESS_KEY` | S3 credentials |
| `AWS_DEFAULT_REGION` | S3 region |
| `AWS_BUCKET` | S3 bucket name |
| `VAPID_PUBLIC_KEY` | Web push public VAPID key |
| `VAPID_PRIVATE_KEY` | Web push private VAPID key |
| `EPAYCO_CUSTOMER_ID` | ePayco merchant ID |
| `EPAYCO_P_KEY` | ePayco private key (webhook signature validation) |
| `EPAYCO_PUBLIC_KEY` | ePayco public key |
| `TINYMCE_API_KEY` | TinyMCE CDN API key |
