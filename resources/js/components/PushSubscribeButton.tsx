import { useEffect, useState } from 'react';

const DENIED_KEY = 'push_denied_at';
const DAYS_RETRY = 3;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const buffer = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        buffer[i] = rawData.charCodeAt(i);
    }
    return buffer.buffer;
}

function shouldAskAgain(): boolean {
    const deniedAt = localStorage.getItem(DENIED_KEY);
    if (!deniedAt) return true; // nunca ha rechazado → preguntar

    const diff = Date.now() - parseInt(deniedAt);
    const daysPassed = diff / (1000 * 60 * 60 * 24);
    return daysPassed >= DAYS_RETRY; // han pasado 3+ días → preguntar de nuevo
}

export default function PushSubscribeButton() {
    const [estado, setEstado] = useState<
        'idle' | 'subscribed' | 'denied' | 'loading' | 'unsupported' | 'waiting'
    >('waiting'); // 'waiting' = aún evaluando

    useEffect(() => {
        console.log('Push support:', 'serviceWorker' in navigator, 'PushManager' in window);
        console.log('Notification permission:', Notification.permission);
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setEstado('unsupported');
            return;
        }

        // Si el navegador ya bloqueó permanentemente
        if (Notification.permission === 'denied') {
            setEstado('denied');
            return;
        }

        // Si ya está suscrito
        navigator.serviceWorker.ready.then(reg => {
            reg.pushManager.getSubscription().then(sub => {
                if (sub) {
                    setEstado('subscribed');
                    return;
                }

                // Verificar si debe preguntar ahora
                if (shouldAskAgain()) {
                    setEstado('idle'); // muestra el botón
                } else {
                    setEstado('unsupported'); // ocultar hasta que pasen los 3 días
                }
            });
        });
    }, []);

    const suscribirse = async () => {
        setEstado('loading');
        try {
            const reg = await navigator.serviceWorker.ready;

            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                // Guardar cuándo rechazó
                localStorage.setItem(DENIED_KEY, String(Date.now()));
                setEstado('unsupported'); // ocultar el botón
                return;
            }

            // Limpiar el registro de rechazo si ahora aceptó
            localStorage.removeItem(DENIED_KEY);

            const { publicKey } = await fetch('/api/push/vapid-key').then(r => r.json());

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            const json = sub.toJSON();
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: json.endpoint,
                    publicKey: json.keys?.p256dh,
                    authToken: json.keys?.auth,
                    contentEncoding: 'aesgcm'
                })
            });

            setEstado('subscribed');
        } catch (err) {
            console.error('Push error:', err);
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
                    body: JSON.stringify({ endpoint: sub.endpoint })
                });
                await sub.unsubscribe();
            }
            setEstado('idle');
        } catch (err) {
            console.error('Unsubscribe error:', err);
        }
    };

    if (estado === 'unsupported' || estado === 'waiting' || estado === 'denied') return null;

    // Reemplaza el return del botón con esto:

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '80px',
                right: '20px',
                zIndex: 99,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '8px',
            }}
        >
            {/* Burbuja de texto — solo cuando está en idle */}
            {estado === 'idle' && (
                <div style={{
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#444',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                    maxWidth: '200px',
                    textAlign: 'center',
                    lineHeight: 1.4,
                }}>
                    🙏 Activa las notificaciones para recibir nuevos devocionales
                </div>
            )}

            {/* Botón flotante */}
            <button
                onClick={estado === 'subscribed' ? desuscribirse : suscribirse}
                disabled={estado === 'loading'}
                title={estado === 'subscribed' ? 'Desactivar notificaciones' : 'Recibir notificaciones'}
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: 'none',
                    background: estado === 'subscribed'
                        ? '#e0e0e0'
                        : 'var(--accent-color)',
                    color: estado === 'subscribed' ? '#555' : '#fff',
                    fontSize: '24px',
                    cursor: estado === 'loading' ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: estado === 'loading' ? 0.7 : 1,
                }}
            >
                {estado === 'loading' && '⏳'}
                {estado === 'subscribed' && '🔕'}
                {estado === 'idle' && '🔔'}
            </button>
        </div>
    );
}