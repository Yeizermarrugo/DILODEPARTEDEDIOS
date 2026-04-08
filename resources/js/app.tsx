import 'bootstrap/dist/css/bootstrap.min.css'; // Instala bootstrap vía npm
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import PrivacyBanner from './components/PrivacyBanner';
import PushSubscribeButton from './components/PushSubscribeButton';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Registrar SW en background — sin pedir permiso todavía
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        setTimeout(() => {
            navigator.serviceWorker.register('/sw.js').catch(() => { });
        }, 1000); // espera 1s después de que la app cargue
    }
});

const STORAGE_KEY = 'welcome_modal_ts';
const TTL_MS = 12 * 60 * 60 * 1000;

function WelcomeModal() {
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        if (stored) {
            const dismissedAt = parseInt(stored, 10);
            if (now - dismissedAt < TTL_MS) {
                return;
            }
            localStorage.removeItem(STORAGE_KEY);
        }

        setOpen(true);

        const mq = window.matchMedia('(max-width: 768px)');
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setOpen(false);
    };


    if (!open) return null;

    return (
        <div
            onClick={handleClose}
            style={{
                position: 'fixed',
                top: 0, left: 0,
                width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                overflow: 'auto',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    borderRadius: '8px',
                    maxWidth: isMobile ? '95vw' : '1000px',
                    width: '100%',
                }}
            >
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '0px',
                        right: isMobile ? '30px' : '65px',
                        background: 'none',
                        border: 'none',
                        fontSize: isMobile ? '2rem' : '2.5rem',
                        color: '#fff',
                        cursor: 'pointer',
                        zIndex: 10,
                    }}
                >
                    &times;
                </button>
                <img
                    src="/assets/img/Estudio Bíblico - 1.png"
                    alt="Bienvenido"
                    style={{
                        width: '90%',
                        height: 'auto',
                        margin: '0 auto 50px auto',
                        borderRadius: '8px',
                        display: 'block',
                    }}
                />
            </div>
        </div>
    );
}


createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <PrivacyBanner />
                <PushSubscribeButton />
                <WelcomeModal />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
