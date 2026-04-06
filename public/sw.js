const CACHE_NAME = 'dilo-v1';
const STATIC_ASSETS = [
    '/',
    '/offline',
];

// Instalación — cachea assets básicos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activación — limpia caches viejos
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

// Fetch — network first, fallback a cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() =>
                caches.match(event.request).then((cached) => cached || caches.match('/offline'))
            )
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