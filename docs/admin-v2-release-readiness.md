# Admin V2: release readiness (Florix task #17)

Branch `admin-v2-int` (worktree `Arambha-worktrees/admin-v2-int`), commit `a05b754`, built on `admin-v2` (`c7a2b04`).
Nothing is merged, pushed or deployed. Florix checkpoints: `refs/florix/checkpoints/manual/20261108T081121Z-*` and later.

## 1. Verified (8 Nov 2026)
| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | 0 errors |
| ESLint | 0 errors, 13 warnings (img / unused vars, pre-existing) |
| Unit tests (`node --test`, 28) | 28/28 pass |
| Accessibility check (`docs/admin-v2-a11y.check.cjs`) | pass |
| Production build (`next build`) | pass |
| Playwright smoke (45: preview screens + logged-out redirects, 360/768/1280) | 45/45 pass |
| Playwright logged-in flows against a fake Supabase (9: login, lists, create also at 360 px, edit, delete, upload, permission denied x2, log out) | 9/9 pass (54 total) |
| Live Supabase RLS (read-only) | writes on categories, products, catalog-media pinned to the admin email; public read |
| Consolidated review | done (Claude, cross-family); findings fixed in `a05b754` |

## 2. Not yet verified (needs the owner)
- Logged-in screens against real data (read-only on live). The UI flows themselves are verified against a fake Supabase.
- Create, edit, delete and media upload against real Row Level Security (staging only).

## 3. Authenticated browser test (read-only on live)
Configuration: the worktree needs the project's Supabase settings file. Claude must not read or copy it, so the
owner copies it (one command, nothing is printed):
`Copy-Item "D:\client\arambha design\Arambha\.env.local" "D:\client\arambha design\Arambha-worktrees\admin-v2-int\"`
(`.env.local` is git-ignored there, as in the main checkout.)

Steps (Claude runs them; the owner only signs in):
1. Claude starts `npm run dev -- --hostname 127.0.0.1 --port 3102` in the worktree and opens a visible browser at `http://127.0.0.1:3102/admin-v2/login`.
2. The owner types the admin email and password into that window (never into chat).
3. Claude checks, without saving anything: dashboard counts match the live site; each collection and subcategory page loads;
   product edit page opens with existing media; gallery grid loads; account menu, Help (classic admin) and log out work;
   hourly-refresh behaviour (stays on the page); phone (390 px) and desktop layouts.
4. Claude closes the browser and deletes the browser profile. No create/edit/delete/upload on live.

## 4. Staging for write tests (no production change)
Options, cheapest first:
- A. New free Supabase project `arambha-staging`. The free plan allows 2 active projects; `ecommerce` and `hangtag` are
  active, so one would need pausing, or the owner accepts a paid project. Owner decision.
- B. Local Supabase (Docker + WSL2 on this PC): free and fully isolated, but needs WSL2/Docker installed (admin, reboot).
Setup once the project exists: run `docs/admin-v2-staging-setup.sql` there (schema, RLS, bucket and seed, mirrored from live),
create a staging admin user, and point a separate `.env.local` at the staging URL and anon key (owner copies it in).
Write tests then: create product with images; edit name/price/description/media; delete product; upload, retry and delete
gallery media; rename/delete subcategory; confirm logged-out writes are refused (RLS).

## 5. Security findings
| # | Finding | Status |
|---|---|---|
| S1 | Supabase leaked-password protection is off (advisor `auth_leaked_password_protection`). | Owner: Supabase > Authentication > enable it. |
| S2 | `supabase_setup.sql` created open "for all users" insert/delete policies; re-running it would have weakened production. | Fixed on admin-v2-int: it now creates the live admin-only policies. |
| S3 | Admin access is decided by RLS (admin email); the app's session checks are a second layer only. | Verified live; keep. |
| S4 | Public sign-ups setting not verified (not readable via SQL). Writes are pinned to the admin email, so a new sign-up cannot write. | Owner: consider disabling sign-ups. |
| S5 | `npm` skipped install scripts for `sharp` and `unrs-resolver`; build and lint pass. | Info. |
| S6 | Outside Arambha: a Cloudflare tunnel token and a Cloudflare password were pasted in chat on 8 Nov. | Owner: rotate the tunnel token and change the password. |

## 6. Readiness checklist
- [x] All child tasks integrated, data layer reconciled
- [x] Type, lint, unit, a11y, build, Playwright checks pass
- [x] Review findings fixed (refresh data loss, dead links, session checks, UI defects)
- [x] Live RLS verified read-only
- [x] Logged-in UI flows verified against a fake Supabase (create, edit, delete, upload, denial, log out)
- [x] Repo setup script no longer creates open write policies (S2)
- [ ] Logged-in read-only test on live (owner sign-in)
- [ ] Staging write tests (owner chooses staging option)
- [ ] S1 leaked-password protection enabled
- [ ] Owner approval to merge

## 7. Owner-controlled merge plan (nothing runs without approval)
1. Review: `git diff admin-v2..admin-v2-int` (or `git log admin-v2..admin-v2-int`).
2. Move `admin-v2` forward (no merge commit, fails safely if diverged), from the `admin-v2` worktree:
   `git merge --ff-only admin-v2-int`
3. Re-run checks on `admin-v2`: `npm ci`, `npx tsc --noEmit`, `npx eslint .`, `npm run build`, `npm run test:e2e`.
4. Only later, with separate approval: open a pull request `admin-v2` -> `main`. Merging `main` may deploy the live site.
Rollback: `admin-v2` before step 2 is `c7a2b04`; Florix checkpoints keep every intermediate state.
