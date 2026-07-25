/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
/**
 * Build/dev configuration for the public marketing site.
 *
 * Two deliberate choices worth keeping:
 *
 * 1. `server.proxy` forwards /api to the backend in dev so the browser talks to
 *    a single origin and never trips CORS while developing. In production the
 *    site points straight at VITE_API_BASE_URL (see src/config/env.ts).
 *
 * 2. `manualChunks` splits the vendor bundle by concern. A marketing site is
 *    judged on first paint, so React/router/data-layer are cached separately
 *    from page code — a content edit must not invalidate the vendor chunk.
 */
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5174, // 5173 belongs to delivery-admin; both can run side by side.
        proxy: {
            '/api': { target: 'http://localhost:4000', changeOrigin: true },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        // Marketing pages are content-heavy but logic-light; warn early if a page
        // chunk starts pulling in something it shouldn't.
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                /**
                 * Function form, not the object form. The object form only matches the
                 * exact package entry module — `react-dom/client` and every internal
                 * file of a package fall through to whichever chunk imported them,
                 * which silently collapses the split (react-dom ends up inside the
                 * router chunk). Matching on the node_modules path splits reliably.
                 */
                manualChunks: function (id) {
                    if (!id.includes('node_modules'))
                        return undefined;
                    if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
                        return 'vendor-react';
                    }
                    if (/[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/.test(id)) {
                        return 'vendor-router';
                    }
                    if (/[\\/]node_modules[\\/](@tanstack|axios)[\\/]/.test(id)) {
                        return 'vendor-data';
                    }
                    if (/[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/.test(id)) {
                        return 'vendor-forms';
                    }
                    if (/[\\/]node_modules[\\/](i18next|react-i18next)/.test(id)) {
                        return 'vendor-i18n';
                    }
                    // Anything else stays with its importer — a catch-all 'vendor'
                    // chunk would be emitted empty today and is not worth the request.
                    return undefined;
                },
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        css: false,
    },
});
