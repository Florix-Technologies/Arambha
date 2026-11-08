# Admin V2 accessibility audit

Date: 2026-11-08. Scope: `components/admin/ui/*`, `AdminShell`, and `tokens.css`.
Changes are uncommitted. Existing `app/admin/page.tsx` was not edited. No dependencies were installed, database connections made, migrations run, or Git metadata written.

## Findings and fixes

| Priority | Finding | Result |
| --- | --- | --- |
| P1 | Controlled Modal has no Radix Trigger for focus return. | Capture the active element before autofocus and restore it on close when it remains connected. ConfirmDialog inherits this. Radix retains focus trapping, Escape, accessible title/description and background isolation. A removed opener still needs browser review; no arbitrary unrelated element is focused. |
| P1 | AdminShell search stopped propagation of every key, including Escape. | Removed that handler so Escape can reach the dialog. |
| P1 | Phone sidebar was simply hidden. | Added a named Radix navigation drawer with an explicit trigger/close button, overlay, scrollable content, active links and close-on-navigation. It closes on entering the desktop breakpoint and moves focus to main instead of the now-hidden drawer trigger. Existing bottom shortcuts remain available. |
| P1 | Form control borders used a low-contrast decorative divider token. | Added `--control-border` and applied it to TextField, TextArea, SelectField and shell search. Decorative dividers keep their existing token. Placeholders explicitly use the muted text token. |
| P2 | IndexTable had no directional navigation. | A single cell is in the roving tab stop. Arrow keys move between cells; Home/End move within a row and Ctrl+Home/End to the first/last cell. Edges clamp. Embedded buttons, links and inputs retain their native keys and Tab stops. Selection and public props remain unchanged. |
| P2 | Fixed-layout tables compressed seven columns into the space beside the tablet sidebar. | Desktop/tablet tables have a 720px minimum width and an overflow wrapper; phones retain stacked rows. Explicit table/rowgroup/row/header/cell roles preserve semantics when CSS changes display modes. Cell focus rings draw inside the scroll container. |
| P2 | Menu highlight removed its outline; disabled items used reduced opacity. | Highlight has an inset focus outline, looping Radix roving focus is explicit, disabled text keeps readable contrast, long text wraps, and disabled links no longer render a live anchor. Trigger has an explicit button type. Radix retains typeahead, arrow keys, Home/End, Escape and trigger focus return. |
| P2 | Portal roots were excluded from descendant-only focus styling. | Focus-visible styling now covers the admin root itself as well as descendants. |
| P2 | Breadcrumbs shared an indistinguishable navigation landmark label. | Breadcrumb landmark names include their path using existing TERMS. |
| P2 | No keyboard bypass for repeated shell navigation. | Added a focus-revealed link to the focusable main landmark. |

## Audit coverage

Reviewed all UI primitives and their CSS, shell, ProductTable caller and Modal/ConfirmDialog callers. Button defaults to `type=button`, has disabled/loading states and suppresses disabled link clicks. TextField/TextArea/SelectField associate labels, hints and errors. ViewToggle uses Radix tabs; Tooltip uses Radix focus/hover handling; Toast uses Radix announcements and a named viewport. Thumbnail requires alt text. EmptyState, Badge, Card and PageHeader use ordinary content semantics.

The only local UI animations are Button's spinner and Skeleton's pulse. Both already stop under `prefers-reduced-motion: reduce`; these rules are retained. Admin scrolling now explicitly uses `auto` in that media query. Drawer and dialog add no entrance animation. This is source verification, not a rendered motion or screen-reader certification.

## Contrast measurements

Calculated with the WCAG sRGB relative-luminance formula from the literal token values; these are token pairs, not a browser pixel audit.

| Pair | Ratio | Threshold |
| --- | ---: | ---: |
| text / surface | 14.03:1 | 4.5:1 |
| text-muted / bg | 6.49:1 | 4.5:1 |
| primary / surface | 5.57:1 | 4.5:1 |
| primary / primary-soft | 4.65:1 | 4.5:1 |
| success / success-soft | 5.22:1 | 4.5:1 |
| warning / warning-soft | 5.28:1 | 4.5:1 |
| danger / danger-soft | 5.61:1 | 4.5:1 |
| focus-ring / bg | 5.12:1 | 3:1 |
| control-border / surface | 3.78:1 | 3:1 |

## Responsive review

| Width | Intended behavior verified in source | Rendered result |
| --- | --- | --- |
| 360px | Sidebar hidden; header exposes drawer trigger. Drawer is 320px wide with a backdrop; body has no sidebar offset. Tables stack, and action groups wrap. | Not verified: app/browser launch blocked. |
| 768px | Fixed 240px sidebar; phone controls hidden. Main has 480px available after its padding, so a 720px table scrolls within its wrapper. | Not verified: app/browser launch blocked. |
| 1280px | Fixed sidebar; main and header use the remaining space, full-width tables and wrapping header actions. | Not verified: app/browser launch blocked. |

## Checks actually run

PowerShell's `npm`/`npx` script shims were denied by execution policy. Retried with their existing `.cmd` launchers; no policy was changed.

- `npx.cmd tsc --noEmit` (offline, installation disabled): **exit 1**. The available global compiler is TypeScript 7.0.2, while this project declares TypeScript 5. Missing local React, Next, Radix and other dependencies produce module/type errors and cascading JSX errors. This is not a passing type check.
- `npm.cmd run lint -- components/admin/AdminShell.tsx components/admin/ui/Modal.tsx components/admin/ui/Menu.tsx components/admin/ui/IndexTable.tsx components/admin/ui/Breadcrumbs.tsx`: **exit 1**, `'eslint' is not recognized as an internal or external command`.
- `npm.cmd run build`: **exit 1**, `'next' is not recognized as an internal or external command`.
- `npm.cmd run dev -- --hostname 127.0.0.1 --port 3023`: **exit 1**, same missing `next` executable; no server started.
- `playwright-cli.cmd --version`: **0.1.23**.
- `playwright-cli.cmd open http://127.0.0.1:3023/admin-preview`: **exit 1**, Chrome crashed before navigation (`crash server failed to launch, self-terminating`). No preview screenshots or rendered viewport findings are claimed.
- Impeccable context launcher: failed because its engine is unavailable and requires a download/cache write. Continued by reading existing source; no engine installed.
- Global `tsc.cmd --ignoreConfig --noCheck --noResolve --jsx react-jsx --module commonjs --target ES2020 --outDir .a11y-check components/admin/AdminShell.tsx <all components/admin/ui/*.tsx>`: **exit 0**, TSX emit/syntax check only, not type checking.
- `node docs/admin-v2-a11y.check.cjs`: **exit 0**. Handler assertions pass for table arrows/bounds/Home/End/Ctrl keys, a shrinking table's tab stop, embedded-control key isolation, Modal connected/disconnected opener handling, description wiring, Menu loop and disabled links, typed/destructive confirmation guards, and the nine contrast pairs above. React/Radix/DOM are mocked: this does not exercise actual focus scopes, layout, screen readers or browser event timing. Temporary emitted files were removed after the run.

Reproduce the focused checks using the project's installed TypeScript (omit `--ignoreConfig` on TypeScript 5):

```powershell
$a11ySources = @(Get-ChildItem components/admin/ui -Filter *.tsx | ForEach-Object { $_.FullName })
npx --no-install tsc --noCheck --noResolve --esModuleInterop --jsx react-jsx --module commonjs --target ES2020 --outDir .a11y-check components/admin/AdminShell.tsx @a11ySources
node docs/admin-v2-a11y.check.cjs
```

## Remaining verification

On a dependency-ready checkout, rerun type checking, targeted lint and build, then open `/admin`, `/admin/interiors`, `/admin/products/new`, and `/admin/login` at 360, 768 and 1280px. Capture screenshots and check horizontal overflow, 200% zoom, sticky controls, long labels and menu placement.

Use keyboard-only interaction to check drawer Tab/Shift+Tab trap, Escape, overlay dismissal, navigation and trigger focus return; resize to 768px while the drawer is open. Exercise Menu arrows/Home/End/typeahead/disabled items and Escape. Exercise table arrows and Tab into embedded controls. Open Modal and ConfirmDialog, check initial safe focus, Escape, Tab/Shift+Tab, close and focus return, including dialogs opened from a closing menu and when an opener is removed. Repeat with reduced motion and a screen reader. These browser/assistive-technology checks remain open because this sandbox cannot run the application.
