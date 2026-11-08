import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/admin',
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:3100',
        browserName: 'chromium',
        serviceWorkers: 'block',
        trace: 'retain-on-failure',
    },
    projects: [360, 768, 1280].map(width => ({
        name: `chromium-${width}`,
        use: { viewport: { width, height: 900 } },
    })),
    webServer: {
        command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
        url: 'http://127.0.0.1:3100/admin/login',
        reuseExistingServer: false,
        timeout: 120_000,
        // Never inherit a real Supabase endpoint.
        env: {
            NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:3100/mock-supabase',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'preview-only-placeholder',
        },
    },
});
