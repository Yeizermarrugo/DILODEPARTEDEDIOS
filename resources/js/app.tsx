import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import PrivacyBanner from './components/PrivacyBanner';
import PushSubscribeButton from './components/PushSubscribeButton';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const STORAGE_KEY = 'welcome_modal_ts';
const TTL_MS = 12 * 60 * 60 * 1000;

function safeLocalStorage(action: 'get' | 'set' | 'remove', key: string, value?: string): string | null {
    try {
        if (action === 'get') return localStorage.getItem(key);
        if (action === 'set' && value !== undefined) localStorage.setItem(key, value);
        if (action === 'remove') localStorage.removeItem(key);
    } catch {
        // Safari bloqueó localStorage — ignorar silenciosamente
    }
    return null;
}

function WelcomeModal() {
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        try {
            const stored = safeLocalStorage('get', STORAGE_KEY);
            const now = Date.now();
            if (stored && now - parseInt(stored, 10) < TTL_MS) return;
            safeLocalStorage('remove', STORAGE_KEY);
        } catch {
            // continuar y mostrar el modal
        }

        setOpen(true);

        const mq = window.matchMedia('(max-width: 768px)');
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const handleClose = () => {
        safeLocalStorage('set', STORAGE_KEY, Date.now().toString());
        setOpen(false);
    };

    if (!open) return null;

    return (
        <div
            onClick={handleClose}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2000, overflow: 'auto',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative', background: 'transparent',
                    borderRadius: 8,
                    maxWidth: isMobile ? '95vw' : 1000,
                    width: '100%',
                }}
            >
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute', top: 0,
                        right: isMobile ? 30 : 65,
                        background: 'none', border: 'none',
                        fontSize: isMobile ? '2rem' : '2.5rem',
                        color: '#fff', cursor: 'pointer', zIndex: 10,
                    }}
                >
                    &times;
                </button>
                <img
                    src="/assets/img/Estudio Bíblico - 1.png"
                    alt="Bienvenido"
                    style={{
                        width: '90%', height: 'auto',
                        margin: '0 auto 50px auto',
                        borderRadius: 8, display: 'block',
                    }}
                />
            </div>
        </div>
    );
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(
        `./pages/${name}.tsx`,
        import.meta.glob('./pages/**/*.tsx')
    ),
    setup({ el, App, props }) {
        createRoot(el).render(
            <>
                <App {...props} />
                <PrivacyBanner />
                <PushSubscribeButton />
                <WelcomeModal />
            </>
        );
    },
    progress: { color: '#4B5563' },
});

initializeTheme();