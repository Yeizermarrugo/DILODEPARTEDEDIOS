import { useEffect, useState } from 'react';

const DENIED_KEY = 'push_denied_at';
const DAYS_RETRY = 3;
const SW_TIMEOUT_MS = 8000;

type Estado = 'waiting' | 'idle' | 'subscribed' | 'loading' | 'unsupported' | 'denied';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const buffer = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) buffer[i] = rawData.charCodeAt(i);
    return buffer.buffer;
}

function shouldAskAgain(): boolean {
    const deniedAt = localStorage.getItem(DENIED_KEY);
    if (!deniedAt) return true;
    const daysPassed = (Date.now() - parseInt(deniedAt, 10)) / 86_400_000;
    return daysPassed >= DAYS_RETRY;
}

function isPushSupported(): boolean {
    return (
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

export default function PushSubscribeButton() {
    const [estado, setEstado] = useState<Estado>('waiting');

    useEffect(() => {
        if (!isPushSupported()) {
            setEstado('unsupported');
            return;
        }

        if (Notification.permission === 'denied') {
            setEstado('denied');
            return;
        }

        const timeout = setTimeout(() => setEstado('unsupported'), SW_TIMEOUT_MS);

        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then(() => navigator.serviceWorker.ready)
            .then((reg) => reg.pushManager.getSubscription())
            .then((sub) => {
                clearTimeout(timeout);
                if (sub) {
                    setEstado('subscribed');
                } else if (shouldAskAgain()) {
                    setEstado('idle');
                } else {
                    setEstado('unsupported');
                }
            })
            .catch(() => {
                clearTimeout(timeout);
                setEstado('unsupported');
            });

        return () => clearTimeout(timeout);
    }, []);

    const suscribirse = async () => {
        setEstado('loading');
        try {
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                localStorage.setItem(DENIED_KEY, String(Date.now()));
                setEstado('unsupported');
                return;
            }

            localStorage.removeItem(DENIED_KEY);

            const reg = await navigator.serviceWorker.ready;
            const { publicKey } = await fetch('/api/push/vapid-key').then((r) => r.json());

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            const json = sub.toJSON();
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: json.endpoint,
                    publicKey: json.keys?.p256dh,
                    authToken: json.keys?.auth,
                    contentEncoding: 'aesgcm',
                }),
            });

            setEstado('subscribed');
        } catch (err) {
            console.error('[Push] Error al suscribirse:', err);
            setEstado('idle');
        }
    };

    const desuscribirse = async () => {
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();

            if (sub) {
                await fetch('/api/push/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }

            setEstado('idle');
        } catch (err) {
            console.error('[Push] Error al desuscribirse:', err);
        }
    };

    if (estado === 'unsupported' || estado === 'waiting' || estado === 'denied') return null;

    const isSubscribed = estado === 'subscribed';
    const isLoading = estado === 'loading';

    return (
        <div style={{
            position: 'fixed', bottom: 80, right: 20,
            zIndex: 99, display: 'flex',
            flexDirection: 'column', alignItems: 'flex-end', gap: 8,
        }}>
            {estado === 'idle' && (
                <div style={{
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: 12,
                    padding: '8px 12px',
                    fontSize: 13, color: '#444',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                    maxWidth: 200, textAlign: 'center', lineHeight: 1.4,
                }}>
                    🙏 Activa las notificaciones para recibir nuevos devocionales
                </div>
            )}

            <button
                onClick={isSubscribed ? desuscribirse : suscribirse}
                disabled={isLoading}
                title={isSubscribed ? 'Desactivar notificaciones' : 'Recibir notificaciones'}
                style={{
                    width: 56, height: 56,
                    borderRadius: '50%', border: 'none',
                    background: isSubscribed ? '#e0e0e0' : 'var(--accent-color)',
                    color: isSubscribed ? '#555' : '#fff',
                    fontSize: 24, cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.7 : 1,
                }}
            >
                {isLoading && '⏳'}
                {isSubscribed && '🔕'}
                {estado === 'idle' && '🔔'}
            </button>
        </div>
    );
}