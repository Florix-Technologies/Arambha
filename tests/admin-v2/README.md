# Admin smoke tests

Run npm run test:e2e with an existing @playwright/test installation and Chromium browser. No dependencies were added or installed.

The suite starts a fresh server on port 3100 with loopback Supabase configuration. External browser requests are blocked and fail the test; service workers are disabled. No credentials, login submissions or data mutations are used. Only unauthenticated redirect checks visit /admin-v2; screen and keyboard checks use static /admin-preview fixtures.

Each test runs at 360, 768 and 1280 pixels and checks console errors and uncaught exceptions. All preview pages are covered, including horizontal page overflow. Keyboard checks verify Tab, Shift+Tab, Enter, destination heading and active navigation marker. Mobile uses bottom navigation; desktop uses the sidebar.

Database authorization and authenticated behavior are outside this smoke suite.
