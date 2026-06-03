# Dilo de Parte de Dios

Plataforma web para una comunidad cristiana que publica devocionales diarios, estudios bíblicos y series de enseñanza. Permite leer, escuchar (TTS), compartir y reaccionar al contenido, con panel de administración integrado.

---

## Características

- **Devocionales diarios** — listado con filtros por categoría, búsqueda y orden por fecha, likes, vistas o compartidos
- **Estudios bíblicos** — sección separada con el mismo modelo de datos
- **Series de enseñanza (Enseñanzas)** — series con episodios agrupados, portada y descripción
- **Text-to-Speech** — reproducción de audio del contenido vía Azure AI Speech, con voces neuronales en español
- **Likes anónimos** — sin registro; identificación por cookie + hash SHA256
- **Compartir con short URL** — genera código corto de 8 caracteres al compartir; registra confirmaciones
- **Notificaciones push** — opt-in vía Web Push (VAPID); enviadas desde Laravel
- **Formulario de contacto** — mensajes con lectura/archivo gestionados desde el dashboard
- **Panel de administración** — estadísticas, publicaciones recientes, gestión de mensajes de contacto
- **Limpieza de almacenamiento** — detecta y elimina archivos huérfanos en el bucket comparando contra `devocionals.imagen`, `devocionals.pdf`, `ensenanzas.imagen`, `post_images.url` y URLs embebidas en el contenido HTML. En desarrollo usa subcarpetas `dev` dentro de cada carpeta base para no mezclar archivos de prueba con producción
- **Contenido programado** — publicación automática de contenido oculto con notificación por correo
- **Donaciones** — integración con ePayco (webhook con validación de firma)
- **Podcast** — sección de contenido de audio
- **Librería de recursos** — descarga de materiales (PDF y otros)
- **Short URLs** — redireccionamiento `/{code}` → devocional o serie
- **Analítica de vistas** — IP anonimizada, país, browser, plataforma, hora local del visitante
- **SEO** — meta tags dinámicos por contenido en `DevocionalDetailsPage`
- **Diseño responsivo** — Tailwind CSS v4 + MUI 7, optimizado para móvil y desktop

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Laravel 12, PHP 8.2, Laravel Octane |
| Frontend | React 19, TypeScript 5.7 |
| Routing bridge | Inertia.js v2 (SPA sin API REST para navegación) |
| Build | Vite 6 |
| Estilos | Tailwind CSS v4, MUI 7, Radix UI |
| Editor | TinyMCE 6 |
| Base de datos | MySQL / PostgreSQL |
| Archivos | Cloudflare R2 (vía Laravel Cloud Object Storage) |
| Email | Resend |
| Push | Web Push + VAPID (`laravel-notification-channels/webpush`) |
| TTS | Azure AI Speech |
| Pagos | ePayco |
| Geolocalización | `stevebauman/location` |

---

## Instalación

### Requisitos
- PHP 8.2+
- Composer
- Node.js 20+
- MySQL o PostgreSQL
- Bucket de almacenamiento S3-compatible (Cloudflare R2, AWS S3, etc.)

### Pasos

```bash
# 1. Clonar
git clone https://github.com/Yeizermarrugo/DILODEPARTEDEDIOS.git
cd DILODEPARTEDEDIOS

# 2. Dependencias PHP
composer install

# 3. Dependencias JS
npm install

# 4. Variables de entorno
cp .env.example .env
php artisan key:generate

# 5. Base de datos
php artisan migrate

# 6. Servidor de desarrollo (dos terminales)
php artisan serve        # → http://localhost:8000
npm run dev              # → http://localhost:5173
```

---

## Variables de entorno

```env
APP_NAME="Dilo de Parte de Dios"
APP_URL=http://localhost:8000
VITE_APP_URL=http://localhost:5173

# Base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dilodepartededios
DB_USERNAME=root
DB_PASSWORD=

# Email (Resend)
MAIL_ENABLED=true
RESEND_KEY=

# Almacenamiento S3-compatible (Cloudflare R2 / AWS S3)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=auto
AWS_BUCKET=
AWS_ENDPOINT=           # URL del endpoint S3 (ej: https://xxx.r2.cloudflarestorage.com)
AWS_URL=                # URL pública de archivos (ej: https://bucket.laravel.cloud)
AWS_USE_PATH_STYLE_ENDPOINT=false

# Web Push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Text-to-Speech
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=eastus
AZURE_SPEECH_OUTPUT_FORMAT=audio-24khz-48kbitrate-mono-mp3

# YouTube
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=

# ePayco (donaciones)
EPAYCO_CUSTOMER_ID=
EPAYCO_P_KEY=
EPAYCO_PUBLIC_KEY=

# TinyMCE (editor de texto enriquecido)
TINYMCE_API_KEY=
```

---

## Estructura del proyecto

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── DevocionalController.php    # CRUD devocionales/estudios, analytics
│   │   ├── EnsenanzaController.php     # CRUD series + episodios
│   │   ├── ContactController.php       # Formulario de contacto, read/archive
│   │   ├── LikeController.php          # Likes anónimos (hash)
│   │   ├── ShortUrlController.php      # Short URLs + share tracking
│   │   ├── TTSController.php           # Azure Speech, caché MP3 en S3
│   │   ├── YouTubeController.php       # Feed YouTube (caché 30min)
│   │   ├── PaymentController.php       # Webhook ePayco
│   │   ├── PushSubscriptionController.php
│   │   ├── ImageUploadController.php   # Subida imágenes a S3 (dev subfolder, CacheControl)
│   │   ├── BulkUploadController.php    # Subida masiva imágenes/videos a S3
│   │   ├── PdfUploadController.php
│   │   └── StorageCleanupController.php # Detecta y elimina archivos huérfanos del bucket
│   ├── Middleware/
│       ├── AssignVisitorId.php         # Cookie visitor_id (1 año, HttpOnly)
│       ├── HandleInertiaRequests.php   # Props globales Inertia
│       ├── HandleAppearance.php        # Tema dark/light/system
│       └── AddSecurityHeaders.php      # CSP, X-Frame-Options, etc.
├── Models/
│   ├── Devocional.php                  # UUID PK, is_devocional (0/1/2), hidden
│   ├── Ensenanza.php                   # UUID PK, slug único
│   ├── DevocionalView.php              # Analytics de vistas
│   ├── ContentLike.php                 # Likes por visitor_hash
│   ├── ContactMessage.php              # Mensajes de contacto
│   ├── Donation.php                    # Registro de donaciones ePayco
│   ├── Visitor.php                     # Suscriptores push
│   └── PostImage.php                   # URLs de imágenes de posts
├── Traits/
│   └── UsesStoragePrefix.php           # storageFolder() — base/dev en dev, base en prod
├── Jobs/
│   └── TrackDevocionalView.php         # View tracking asíncrono
├── Services/
│   └── ShortCodeService.php            # Genera short codes únicos
├── Rules/
│   └── ValidImageContent.php           # Valida contenido real de imagen subida
├── Console/Commands/
│   ├── NotificarDevocionalDiario.php   # Push notification del contenido de hoy
│   └── PublicarContenidoProgramado.php # Publica contenido oculto programado
└── Mail/
    ├── ContactFormMail.php
    └── ContenidoPublicadoMail.php

resources/
├── js/
│   ├── pages/                          # Páginas Inertia (React)
│   ├── components/                     # Componentes reutilizables
│   │   └── ui/                         # Primitivos shadcn/Radix
│   └── hooks/                          # useLike, useShareUrl, etc.
└── css/                                # CSS por página + app.css global

routes/
├── web.php                             # Rutas web + dashboard
├── api.php                             # API: likes, push, TTS, short URLs
├── auth.php                            # Login, registro, reset
└── settings.php                        # Perfil, contraseña, apariencia
```

---

## Modelo de contenido

La tabla `devocionals` sirve tres tipos de contenido distinguidos por `is_devocional`:

| Valor | Tipo | URL |
|-------|------|-----|
| `0` | Estudio bíblico   | `/estudios`     |
| `1` | Devocional diario | `/devocionales` |
| `2` | Series tematicas  | `/series/{id}`  |

Las **series** tienen su propia tabla `ensenanzas` (UUID PK, slug único). Los episodios son filas en `devocionals` con `ensenanza_id` y `serie = 'Series'`.

---

## Privacidad y anonimato

- **Visitor ID:** cookie HttpOnly UUID (1 año). El UUID nunca se almacena en DB — solo su hash SHA256.
- **Likes:** `visitor_hash = SHA256(uuid|content_id|content_type)` — sin PII en la tabla `content_likes`.
- **Vistas:** IP anonimizada: último octeto reemplazado por `.0` antes de guardar.
- **Donaciones:** IP del donante guardada en `donations` solo para auditoría de fraude.

---

## Comandos útiles

```bash
# Limpiar cachés de Laravel
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Formatear código PHP
php artisan pint

# Generar claves VAPID para Web Push
php artisan webpush:vapid

# Ver rutas registradas
php artisan route:list

# Comandos programados (ejecutados por el scheduler)
php artisan devocional:notificar-diario       # Push para contenido de hoy
php artisan contenido:publicar-programado     # Publica contenido oculto de hoy

# TypeScript check
npm run types

# Build de producción
npm run build
```

---

## Contribuciones

Pull requests bienvenidos. Para cambios grandes, abre un issue primero para discutir la dirección.

- **Backend:** PHP 8.2, tipos estrictos, sin tests automáticos — verificar visualmente.
- **Frontend:** TypeScript estricto, sin `any`. Componentes en `resources/js/components/`, páginas en `resources/js/pages/`.
- **Estilos:** Tailwind v4 + CSS por página en `resources/css/`. Paleta de colores: `#2d465e`, `#f75815`, `#faf8f4`.

---

## Licencia

MIT © 2026 [Yeizer Marrugo](https://github.com/Yeizermarrugo)

**Desarrollado para comunidades cristianas que buscan compartir inspiración y reflexión diaria de forma moderna y accesible.**

---

## Autores

**Yeizer Marrugo**
- GitHub: [@Yeizermarrugo](https://github.com/Yeizermarrugo)
- Email: yeizermarrugo@gmail.com

**Diana Lopez**
- Email: dilodepartededios@gmail.com
