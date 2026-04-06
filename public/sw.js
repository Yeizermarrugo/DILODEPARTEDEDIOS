const CACHE_NAME = 'dilo-v2';
const STATIC_ASSETS = ['/offline'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Solo cachea assets estáticos, ignora rutas de Laravel e Inertia
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Ignorar rutas dinámicas de Laravel/Inertia
    const ignorar = [
        '/api/',
        '/devocionales',
        '/series',
        '/estudios',
        '/devocional/',
        '/estudio-biblico/',
        '/push/',
        '/sanctum/',
        '/__vite',
        '/hot',
    ];

    if (ignorar.some((path) => url.pathname.startsWith(path))) return;

    // Solo cachea archivos estáticos reales
    const esAsset =
        url.pathname.startsWith('/build/') ||
        url.pathname.startsWith('/assets/') ||
        url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf|css|js)$/);

    if (!esAsset) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request).then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            });
        }).catch(() => {
            if (event.request.destination === 'document') {
                return caches.match('/offline');
            }
        })
    );
});

// Push
self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};

    event.waitUntil(
        self.registration.showNotification(data.title ?? 'Nueva publicación', {
            body:    data.body ?? '',
            icon:    data.icon ?? '/assets/img/logo.png',
            badge:   '/icon-192.png',
            data:    data.data ?? {},
            actions: [{ action: 'open', title: 'Ver ahora' }],
        })
    );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes(url) && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) return clients.openWindow(url);
            })
    );
});