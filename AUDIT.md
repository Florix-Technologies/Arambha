# Arambha website audit

Date: 5 November 2026. Measured with Playwright, Lighthouse and axe on a local production build, with every database write blocked. No data was changed.

Screenshots: [before](docs/audit/before.jpg) and [after](docs/audit/after.jpg).

## Summary

| Severity | Found | Fixed | Open |
|---|---:|---:|---:|
| Critical | 1 | 1 | 0 |
| High | 13 | 12 | 1 (needs the owner) |
| Medium | 15 | 9 | 6 |
| Low | 4 | 0 | 4 |

| Lighthouse | Before | After |
|---|---:|---:|
| Home, mobile performance | 73 | 98 |
| Home, mobile largest paint | 7.5 s | 1.1 s |
| Interiors, mobile performance | 58 | 83 |
| Interiors, layout shift | 1.44 | 0 |
| Contact, mobile performance | 79 | 100 |
| Home, desktop performance | 98 | 100 |
| Accessibility on Home, Interiors and Contact | 86 to 96 | 100 |
| axe violations, 7 pages at 2 widths | 7 rules | 0 |
| Pages with sideways scroll, 7 pages at 7 widths | 0 | 0 |

Scores are the middle of three runs for mobile and one run for desktop.

## Critical

| # | Problem | Status |
|---|---|---|
| 1 | The Contact form's service select had no name for screen readers | Fixed |

## High

| # | Area | Problem | Status |
|---|---|---|---|
| 1 | Performance | Home's heading stayed hidden until a fade-in started, so phones saw it after 7.5 s | Fixed |
| 2 | Performance | Contact had the same hidden heading, and the map added 1.1 MB of Google Maps code to the first load | Fixed |
| 3 | Performance | Interiors jumped on phones as content arrived after the footer | Fixed |
| 4 | Accessibility | Text colours were too faint in 38 places on public pages | Fixed, with colour tokens in `globals.css` |
| 5 | Design | The Opening Hours card on Contact was white on a light background on phones | Fixed |
| 6 | Accessibility | The map had no title | Fixed |
| 7 | Branding | Nav links, buttons and card titles rendered in Times New Roman, because they pointed at a font variable that does not exist; one section used Arial | Fixed |
| 8 | Security | No security headers, and the server announced Next.js | Fixed |
| 9 | Mobile | Text under 16px and tap targets under 44px on every page | Fixed |
| 10 | Branding | `/favicon.ico` returned 404 | Fixed |
| 11 | Admin | Hard to use on a phone, and category rows could not be reached by keyboard | Fixed |
| 12 | Admin | Choosing a new main file silently replaced the old one (see Content) | Fixed: the wizard now asks first |
| 13 | Domain | `https://arambhainteriorstudio.com` without www gives a certificate error, because of a stray DNS record | **Open: only the owner can remove it** |

## Medium

Fixed: real labels on the Contact inputs; the phone menu announces whether it is open; no second `main` landmark; heading order; a sharing image on every page; descriptions under 160 characters; the admin kept out of search results; one brand name; a neutral colour instead of blank white while videos load.

Open:

| # | Problem | Suggested fix |
|---|---|---|
| 1 | Home loads stock photos from images.pexels.com, which sets third-party cookies and holds Best Practices at 77 | Copy them into the site's files, or use Arambha's own project photos |
| 2 | Videos in `public/` total 143 MB, the largest 17 MB | Re-encode each to under 5 MB with HandBrake |
| 3 | 72 videos on Home and Gallery have no poster image | Add a small poster for each video |
| 4 | `logo1.png` and `logo2.png` are 262 KB each and load on every page | Export a 40 KB WebP logo and a 32px favicon |
| 5 | Interiors takes 4.7 s for its largest paint on a slow connection, because of a large product photo | Serve product photos through `next/image`, which also clears 10 lint warnings |
| 6 | Gallery cards mix five different shapes | Choose one or two card ratios |

## Low

| # | Problem | Suggested fix |
|---|---|---|
| 1 | 58 different colour values, only partly moved to tokens | Move the rest over time |
| 2 | An unknown filter in the address shows the empty message on Interiors and Furniture | Show all items, as Gallery does |
| 3 | A database outage shows the friendly empty message, so it looks like an empty catalogue | Show "We could not load this right now, please try again" |
| 4 | The phone menu does not close with the Escape key | Close it and return focus to the button |

## Functional checks that passed

Internal links; gallery filters; the Services select; the phone menu; Contact validation (an empty form is stopped, a bad email is refused, and sending opens WhatsApp with no data stored); WhatsApp links use the full number with correct encoding; no JavaScript errors, broken images or broken videos on public pages; `robots.txt` and `sitemap.xml`.

## Security checks

No secrets in the client bundle (1 MB of JavaScript scanned). The database key in the browser is the public one by design, and writes are limited to the admin by row level security. New headers: HSTS, nosniff, frame, referrer, permissions and a narrow Content Security Policy that does not restrict scripts. A stricter policy would need testing against the map and the videos.

## Content and data (nothing was changed)

| Item | Detail |
|---|---|
| Sample prices | Three Aluminium Interior items are public with sample prices of 28,000, 52,000 and 32,000 (kept by the owner's choice) |
| Unused video | The partition wall's MP4 uploaded, then a JPEG in the same field replaced it, so the item shows a photo. The 38.7 MB MP4 is still in storage |
| Other unused uploads | Four more uploaded files are not used by any item |
| Repeated photos | 10 main images are used on more than one item, and on the partition wall the extra photo is the same as the main one |
| Missing prices | 25 of 28 items have no price, which is allowed |
| Empty categories | Interiors: Wooden interior, Kitchen Designs, Living Room, Bedrooms, Wardrobes |
| Outside hosting | Some item photos are on images.unsplash.com rather than in the site's storage |

## Not tested

Real phones and Safari: Windows Smart App Control blocks Safari's engine here, so "iPhone" means Chrome with an iPhone profile. Real uploads and saving were mocked, because the database is production.
