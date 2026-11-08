const PORT = process.env.E2E_PORT ?? '3100';
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/admin',
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        browserName: 'chromium',
        serviceWorkers: 'block',
        trace: 'retain-on-failure',
    },
    projects: [360, 768, 1280].map(width => ({
        name: `chromium-${width}`,
        use: { viewport: { width, height: 900 } },
    })),
    webServer: {
        // PERF_PROD=1 serves the production build (perf.spec.ts).
        command: `npm run ${process.env.PERF_PROD ? 'start' : 'dev'} -- --hostname 127.0.0.1 --port ${PORT}`,
        url: `http://127.0.0.1:${PORT}/admin/login`,
        reuseExistingServer: false,
        timeout: 120_000,
        // Never inherit a real Supabase endpoint.
        env: {
            NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${PORT}/mock-supabase`,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'preview-only-placeholder',
        },
    },
});
