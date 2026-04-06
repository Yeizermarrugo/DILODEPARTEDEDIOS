import 'bootstrap/dist/css/bootstrap.min.css'; // Instala bootstrap vía npm
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import PrivacyBanner from './components/PrivacyBanner';
import { initializeTheme } from './hooks/use-appearance';
import PushSubscribeButton from './components/PushSubscribeButton';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Registrar SW en background — sin pedir permiso todavía
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }
});


createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <PrivacyBanner />
                <PushSubscribeButton/>
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
