# Arambha: release readiness (Florix task #17, sprint 9 Nov 2026)

Branch `admin-v2-int`, started from `5618e8c` (live since PR #4). Nothing pushed, merged or deployed; no live
database or DNS change. See also `docs/seo-local-plan.md` (domain, Business Profile, Search Console, GA4).

## 1. Completed in this sprint
- **Subcategory delete works.** Empty: deleted after confirmation. With products: the dialog moves every product still in
  it to a chosen subcategory, re-checks it is empty, then deletes. Products are never deleted with a subcategory.
  Rename keeps the web address (slug), so old links keep working.
- **Database safeguard** `docs/admin-v2-restrict-category-delete.sql`: ON DELETE RESTRICT plus optional `seo_title` /
  `seo_description`, one transaction, rollback included. Tested on an isolated PGlite copy of the live schema and RLS
  (`docs/admin-v2-restrict-category-delete.test.mjs`): cascade loss reproduced before, refused after, move-then-delete
  works, other accounts denied, rollback works. The admin detects the migration (seo_title readable) and only then allows
  deleting; before it, the dialog explains and sends nothing. After the owner runs the SQL it works without a release.
  `supabase_setup.sql` now creates RESTRICT for new installs.
- **Help and guided tour**: Help button in the top bar on every admin screen (phones too); 9-step tour on real elements
  (Back / Next / Skip / Finish, Esc, docked on phones, respects reduced motion, never drops unsaved form input);
  "Take a tour" on the Help page restarts it.
- **Admin speed**: whole catalog in 2 queries with needed columns, shared across admin pages; Overview no longer downloads
  every photo/video (checks on demand); lazy thumbnails, videos load when visible.
- **Public SEO**: readable subcategory and product URLs with generated titles, descriptions, canonical, Open Graph, alt
  text, BreadcrumbList and (only with a real price) Product JSON-LD; thin products noindex; dynamic sitemap with images;
  on-demand refresh after every admin save (`/api/revalidate`, admin token checked server-side); old `?filter=` links
  308 to the new URLs; square favicon/app icons from the emblem; WebSite + LocalBusiness logo JSON-LD; JSON-LD escaped.
- **Conversion tracking** (`click_call`, `click_whatsapp`, `click_enquiry`, `submit_enquiry`) ready for GA4.
- **Bare domain → www** 308 in `next.config.ts` (works once Vercel serves the bare domain, see owner actions).

## 2. Verification (9 Nov)
TypeScript 0 errors · ESLint 0 errors (7 warnings: intentional `<img>` for remote catalog images) · unit tests 42/42 ·
Playwright 78 passed at 360/768/1280 (15 env-gated demo/live/perf specs skipped) · live read-only screenshots 2/2 ·
production build with live data · curl checks of routes, redirects, icons, sitemap, 404s, admin noindex ·
independent Codex review via Florix: 2 high + 1 medium found and fixed (JSON-LD escaping, delete gated on the
database safeguard, tour respects unsaved changes).

## 3. Measured speed (production builds, live data)
Admin (perf.spec.ts): cold Overview 18 → 5 Supabase requests, 1.25 → 0.59 MB; moving between admin pages 7–15 → 0
requests, Interiors 889 → 143 ms, subcategory 883 → 108 ms, Media Library 980 → 162 ms.
Public, Lighthouse mobile (simulated slow 4G): LCP `/` 6.5 → 2.7 s, `/interiors` 5.7 → 4.0 s, `/gallery` 6.4 → 3.9 s,
`/services` 39.6 → 5.5 s; CLS `/services` 0.776 → 0; transfer `/services` 17.3 → 1.1 MB; SEO score 100.
Not yet good: TBT on `/` ~1.3 s (animation library and many client components) and large hero videos (up to 18 MB).
Real-user Core Web Vitals (75th percentile) can only be read from Search Console after release.

## 3a. Final release verification (9 Nov, after the last commit)
- Full Playwright suite on `bc5a538`: 78 passed, 15 skipped. The skipped ones are opt-in tools, not release workflows:
  demo screenshots (6), live read-only screenshots (6) and admin perf measurement (3), each running only at 1280 with
  env flags. TypeScript 0, unit 42/42, ESLint 0 errors, production build with live data passes.
- Real login gate (production build, live Supabase, no credentials used): `/admin`, `/admin/interiors`, `/admin/help`,
  `/admin/products/new` all send a signed-out visitor to `/admin/login`; a wrong login is refused by Supabase (400) with
  a clear message; admin is `noindex, nofollow`. The signed-in walk-through on real data needs the owner's login (below).
- Live database, read-only: FK is `products_category_id_fkey … ON DELETE CASCADE` (name matches the SQL), 0 orphan or
  null `category_id` (28 products, 12 categories), no views/triggers depend on the tables, owner `postgres`, admin-only
  write policies. So the SQL validates instantly and changes no data or permissions.
- Speed pass: 12 decorative videos re-encoded (no audio track, same resolution, +faststart): 64 → 41 MB; home sliders
  skip the 1/3 of cards that can never be on screen; `/services` loading placeholder fills the screen.
  A/B on this machine (Lighthouse mobile, 2 runs each): `/services` CLS 0.539 → 0, score 53–54 → 74–75; home TBT
  68–71 → 57–58 ms; home LCP unchanged at 4.1–4.3 s (simulated slow 4G; the LCP is the hero heading, observed ~0.4 s).
  The earlier 2.7 s home figure was measured under different load and is not reproducible today.
- Domain (public DNS + HTTPS probes; the Vercel API refused the team scope, so the project's domain list was not read):
  www → CNAME to Vercel, valid certificate. Bare domain has TWO A records: `216.198.79.1` (Vercel, but the certificate is
  www-only: the bare domain is not added to the project) and `2.57.91.91` (Hostinger "Parked Domain" page). Nameservers
  `ns1/ns2.dns-parking.com` (Hostinger).
- SEO on the production build: unique title, description, canonical (www), Open Graph on all public pages; Breadcrumb
  JSON-LD on subcategory/product pages; Product JSON-LD only with a real price; WebSite + LocalBusiness JSON-LD;
  sitemap 15 URLs + 18 images; robots blocks `/admin` and `/api/`; favicon.ico, icon.png, apple-icon, 192/512 icons,
  manifest and og-default all 200; no `<img>` without alt.
- SEO overrides: `seo_title` / `seo_description` are OPTIONAL. Public pages read them through `select('*')`, so they
  work without the columns (verified on the live, unmigrated database). The only ESSENTIAL database change is the
  RESTRICT foreign key, which delete needs; the columns travel in the same transaction because the admin uses them to
  detect that RESTRICT is in place.

## 4. Owner actions (Claude did not do these)
1. Approve the merge/deploy of `admin-v2-int` (PR into `main`; Vercel deploys). After it, sign in once on the live admin
   and click through Overview, a subcategory, a product (no save), Help and "Take a tour" (5 minutes).
2. Run `docs/admin-v2-restrict-category-delete.sql` in the Supabase SQL editor; subcategory delete then switches on.
3. Vercel → Project → Domains: add `arambhainteriorstudio.com` with "Redirect to www" (308) and use the DNS value Vercel
   shows there. Hostinger DNS: delete only the `@ A 2.57.91.91` parking record (keep `@ A 216.198.79.1` if Vercel
   confirms it, plus all MX/TXT/other records).
4. Search Console: verify the domain, submit the sitemap, request indexing of `/`.
5. GA4: create a property, set `NEXT_PUBLIC_GA_ID` in Vercel, mark the enquiry events as key events.
6. Google Business Profile: confirm ownership, primary category "Interior designer", website URL with www, square logo.
7. Supabase: enable leaked-password protection. Rotate the Cloudflare token pasted in chat on 8 Nov.

## 5. Rollback
`main` before the merge is `470957c`; Florix checkpoints under `refs/florix/checkpoints/manual/*`. The SQL file has a
rollback block.
