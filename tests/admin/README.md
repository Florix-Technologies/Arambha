# Admin browser tests

`npx playwright test` starts `next dev` on 127.0.0.1:3100 with a loopback Supabase URL and runs at 360, 768 and 1280 px.
All Supabase traffic (auth, REST `categories`/`products`, storage) is served by an in-memory fake in `fixture.ts` via `page.route`; any other external request, uncaught error or console error fails the test (expected: the 403 of denial tests and the intentionally broken image).

- `admin.spec.ts`: redirects when logged out, login, Overview counts, Needs attention, navigation + Back/Forward, subcategory add/edit, delete switched off (no DELETE sent), Kitchen page, add product with prefilled category, upload + Make cover, move/delete product, permission denial, overflow, log out.
- `demo.spec.ts`: owner screenshots, only with `DEMO=1 npx playwright test demo --project=chromium-1280` (output dir via `DEMO_DIR`).

Real Row Level Security is not covered here.
