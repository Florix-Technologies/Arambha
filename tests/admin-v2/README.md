# Admin smoke tests

Run npm run test:e2e with an existing @playwright/test installation and Chromium browser. No dependencies were added or installed.

The suite starts a fresh server on port 3100 with loopback Supabase configuration. External browser requests are blocked and fail the test; service workers are disabled. No credentials, login submissions or data mutations are used. Only unauthenticated redirect checks visit /admin-v2; screen and keyboard checks use static /admin-preview fixtures.

Each test runs at 360, 768 and 1280 pixels and checks console errors and uncaught exceptions. All preview pages are covered, including horizontal page overflow. Keyboard checks verify Tab, Shift+Tab, Enter, destination heading and active navigation marker. Mobile uses bottom navigation; desktop uses the sidebar.

Database authorization and authenticated behavior are outside this smoke suite.

## Logged-in flow tests (flows.spec.ts)

Logged-in Admin V2 flows run in a real browser against an in-memory fake of Supabase (auth, REST and storage) served with Playwright request interception on the loopback mock origin. No credentials, real project or live data are used; any request outside 127.0.0.1, any uncaught exception and any console error fails the test.
Covered: login and dashboard totals, collection and subcategory lists, product create (also at 360 px), edit (including empty price saved as null), delete with confirmation, gallery upload (no upsert), permission denial (zero rows and 42501) keeping the form, and log out.
Not covered: real Row Level Security. That is checked read-only on the live database and must be exercised on a staging project (docs/admin-v2-staging-setup.sql).
