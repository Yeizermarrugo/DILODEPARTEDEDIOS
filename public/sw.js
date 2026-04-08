const CACHE_NAME = 'dilo-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((key) => caches.delete(key)))
        )
    );
    self.clients.claim();
});

self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};
    event.waitUntil(
        self.registration.showNotification(data.title ?? 'Nueva publicación', {
            body:  data.body ?? '',
            icon:  data.icon ?? '/assets/img/logo.png',
            badge: '/icon-192.png',
            data:  data.data ?? {},
            actions: [{ action: 'open', title: 'Ver ahora' }],
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes(url) && 'focus' in client) return client.focus();
                }
                if (clients.openWindow) return clients.openWindow(url);
            })
    );
});