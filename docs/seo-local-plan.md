# Arambha: local SEO, domain and Google Business Profile plan (9 Nov 2026)

Canonical site: `https://www.arambhainteriorstudio.com/` (already indexed; keep it).
Sources: Google Search Central (favicon, site names, AI features, structured data), Google Business Profile guidelines,
and a manual look at the current results for the queries below. No keyword volumes or ranking forecasts are claimed:
none were measured. Growth is measured in Search Console (impressions, clicks) and GA4 (enquiry events) over months.

## 1. Domain (checked 9 Nov)
| Check | Result |
|---|---|
| `www` DNS | CNAME to Vercel, valid Let's Encrypt certificate, HTTP→HTTPS 308, path and query kept |
| Bare domain DNS | Nameservers `ns1/ns2.dns-parking.com` (Hostinger). Public DNS (1.1.1.1) returns only Vercel's `216.198.79.1`; one local resolver still returned a second parking address `2.57.91.91` |
| Bare domain HTTPS | Vercel answers with a certificate for `www` only → browsers show a certificate error. Vercel has no certificate for the bare domain, so the bare domain is not added to the Vercel project |

Owner actions (account-level, not done by Claude):
1. Vercel → project `arambha_design` → Settings → Domains → Add `arambhainteriorstudio.com` → choose "Redirect to `www.arambhainteriorstudio.com`" (308). Vercel then issues its certificate.
2. Hostinger DNS: keep exactly one A record for `@` = `216.198.79.1`; delete any other `@` A/AAAA record (e.g. `2.57.91.91`).
3. Verify: `https://arambhainteriorstudio.com/interiors?x=1` → 308 → `https://www.arambhainteriorstudio.com/interiors?x=1`, no certificate warning.
The site code also redirects the bare host to `www` (next.config.ts) as a safety net once the certificate exists.

## 2. Search intent → page map (real services only)
| Intent (Bangalore / Bengaluru) | Page | Notes |
|---|---|---|
| interior designers in Bangalore, home interior design Bangalore, interior designers Rajajinagar | Home `/` | Rajajinagar address, services, consultation CTA |
| modular kitchen design Bangalore | `/services` (Kitchen), `/interiors/<kitchen subcategory>` | Real kitchen photos |
| bedroom interiors, wardrobe design | `/services` (Wardrobe), interiors subcategories | |
| living room interior design, TV unit, crockery unit, pooja room | `/services` | |
| custom furniture / sofas Bangalore | `/furniture`, furniture subcategories and product pages | |
| office furniture, aluminium partitions | `/services` (Office & Commercial Furniture, Aluminium Interiors & Partitions) | Full office fit-outs are not claimed |
Karnataka-wide wording only where the studio really takes projects; no locality doorway pages.
Current results for these queries are dominated by aggregators (HomeLane, NoBroker, Livspace) with locality pages; Arambha competes on its own photos, a complete Business Profile, reviews from real clients and fast, specific pages.

## 3. Google Business Profile (owner must sign in; nothing changed by Claude)
- First confirm the listing is Arambha's own (address No.11/68/1, 2nd Floor, 59th Cross, 4th Block, Rajajinagar, Bengaluru 560010; phone +91 91876 28243). Do not edit or merge a similarly named business.
- Primary category: **Interior designer** (not "Corporate office"). Additional only if true: Furniture store / Furniture maker, Kitchen remodeler, Cabinet maker.
- Services: Modular kitchens, Wardrobes, Living room & TV units, Crockery units, Pooja rooms, Washrooms, False ceiling, Lighting, Flooring, Painting, Civil works, Custom furniture, Office & commercial furniture, Aluminium partitions.
- Website: `https://www.arambhainteriorstudio.com/`; hours as on the site (Mon–Sat 10:00–19:00) if correct; service area: Bengaluru (add other Karnataka districts only where projects are taken).
- Logo: the square emblem `public/icon-512.png` (Business Profile logo is separate from the search favicon). Cover and 10+ real project photos; add new project photos monthly.
- Ask satisfied clients for reviews through the profile's review link; reply to every review. Never buy or script reviews.

## 4. Search Console / GA4 (owner access needed)
- Search Console: add a Domain property `arambhainteriorstudio.com` (DNS TXT at Hostinger) → Sitemaps → submit `https://www.arambhainteriorstudio.com/sitemap.xml` → URL Inspection → "Request indexing" for `/`, `/services`, `/interiors`, `/furniture`.
- Favicon and site name update only after Google recrawls the home page (days to weeks; cannot be forced).
- GA4: create a property, add `NEXT_PUBLIC_GA_ID=G-XXXX` in Vercel → Environment Variables (Production), redeploy. Mark `click_call`, `click_whatsapp`, `submit_enquiry` as key events. Without the variable no analytics script loads.
