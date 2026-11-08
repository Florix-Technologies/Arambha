# Admin: release readiness (Florix task #17)

Branch `admin-v2-int` (worktree `Arambha-worktrees/admin-v2-int`), built on `admin-v2` (`c7a2b04`).
Nothing is merged, pushed or deployed. Florix checkpoints: `refs/florix/checkpoints/manual/*`.

## 1. What changed (8 Nov 2026 redesign)
- One admin at `/admin`. The classic admin (`app/admin/page.tsx`, item wizard, tour), `/admin-preview` and `/admin-v2` are removed; no redirects or fallbacks.
- Hierarchy: main category (Furniture, Interiors, Gallery) › subcategory › products. No fourth level.
- Navigation: sidebar Overview · Catalog (Furniture, Interiors, Gallery) · Media Library · Settings · Help; phone bottom bar Overview, Furniture, Interiors, Gallery, More. Breadcrumbs on every page; the product form marks its main category active.
- Main category page: subcategories with product counts, Add subcategory, Edit (rename) and Delete.
- Subcategory page: only that subcategory's products; search, sort, Edit, Move (within the main category), Delete. "Add product" pre-selects the main category and subcategory. Gallery subcategories accept multi-file uploads (one item per file, retry on failure).
- Product form: direct photo/video upload to storage with progress, previews, cover (first item, "Make cover"), reorder, remove, add from link (Google Drive/ImgBB), validation, save blocked while uploading, unsaved-changes guard. After adding, opens the subcategory page.
- Overview: catalog table (each main category opens its page), recently added, Needs attention (missing or broken photos checked in the browser, empty subcategories), Add product.
- Media Library: every catalog photo/video, filter by main category and broken files. Settings: password reset email. Help: guides for the new screens.
- Thumbnails show video frames and flag files that fail to load. Arambha emblem plus wordmark in the sidebar (cropped from `logo2.png`).
- Inquiry popup hidden on all `/admin` pages; robots disallow `/admin`.

## 2. Subcategory delete: blocked for release
Live `products.category_id` is `ON DELETE CASCADE` (checked 8 Nov). Deleting a subcategory deletes its products, and a product
added between the app's count and the delete would be lost. So `SUBCATEGORY_DELETE_ENABLED = false` in `lib/admin/data.ts`:
the dialog explains it and sends nothing. Products can still be moved and subcategories renamed.
To enable safely (owner approval): run `docs/admin-v2-restrict-category-delete.sql` on the live project (one atomic constraint
change to `ON DELETE RESTRICT`, no rows changed, rollback included), then set the flag to `true`. The app then moves products
first and the database refuses any delete that would remove products (error 23503 is shown as "Move them first").

## 3. Live media references (read-only check, 8 Nov)
All 28 products' media resolve: local `/v*.mp4` and `/i*.jpeg` exist in `public/`, storage and Unsplash URLs return 200.
No broken references to repair. One product ("Sleek Aluminium Window Frames") repeats its cover as its extra photo.

## 4. Verification
See the Florix #17 notes for the latest run (TypeScript, ESLint, unit tests, accessibility check, production build,
Playwright 360/768/1280 against a fake Supabase, demo screenshots, independent Codex review).
Not yet done: logged-in read-only pass on live data (owner signs in to a browser window; no writes).

## 5. Security findings
| # | Finding | Status |
|---|---|---|
| S1 | Supabase leaked-password protection is off. | Owner: Authentication > enable it. |
| S2 | `supabase_setup.sql` used to create open write policies. | Fixed: admin-only policies, as live. |
| S3 | Writes are authorised by RLS (admin email); app checks are a second layer. | Verified live. |
| S4 | Public sign-ups setting not readable via SQL; a new sign-up still cannot write. | Owner: consider disabling sign-ups. |
| S6 | A Cloudflare token and password were pasted in chat on 8 Nov (outside Arambha). | Owner: rotate/change. |
| S7 | Subcategory delete cascades to products in the database. | Blocked in app; DB fix awaiting approval (section 2). |

## 6. Readiness checklist
- [x] Single `/admin`, legacy admin and previews removed
- [x] Hierarchy, navigation, subcategory and product workflows, direct upload
- [x] Subcategory delete cannot lose products (blocked until DB protection)
- [x] Live RLS verified (read-only and rolled-back write test)
- [ ] Logged-in read-only pass on live (owner sign-in)
- [ ] S1 leaked-password protection enabled
- [ ] Owner decision on `admin-v2-restrict-category-delete.sql`
- [ ] Owner approval to merge

## 7. Merge plan (nothing runs without approval)
1. Review: `git log admin-v2..admin-v2-int`, `git diff admin-v2..admin-v2-int`.
2. From the `admin-v2` worktree: `git merge --ff-only admin-v2-int`.
3. Re-run: `npm ci`, `npx tsc --noEmit`, `npx eslint .`, `npm run build`, `npm run test:e2e`.
4. Separately approved later: pull request `admin-v2` -> `main` (merging `main` may deploy the live site; `/admin` then serves the new admin).
Rollback: `admin-v2` before step 2 is `c7a2b04`; Florix checkpoints keep every intermediate state.
