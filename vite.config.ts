import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ isSsrBuild }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx', 'resources/css/devocionalDetails.css'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    define: {
        'process.env': {},
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: isSsrBuild ? undefined : {
                    'vendor-react':   ['react', 'react-dom', '@inertiajs/react'],
                    'vendor-mui':     ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                    'vendor-tinymce': ['@tinymce/tinymce-react'],
                },
            },
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        cors: true, // ESTE ES EL SALVAVIDAS
        origin: process.env.VITE_APP_URL || 'http://localhost:8000',
        hmr: {
            host: (process.env.VITE_APP_URL || 'http://localhost:8000').replace('https://', ''),
            protocol: 'wss',
        },
    },
}));
