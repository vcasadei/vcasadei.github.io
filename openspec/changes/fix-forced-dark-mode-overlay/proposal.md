## Why

The entire site renders almost black — text and background alike crushed to near-illegibility — for any visitor whose OS/browser appearance is set to **light** mode. Reproduces deterministically on both Android (WhatsApp's in-app browser) and desktop macOS Chrome, purely based on the OS light/dark setting.

**Root cause correction**: initial investigation assumed this was a browser-level "force dark" heuristic and the fix was a `color-scheme` meta tag (see below) — that fix shipped but did not resolve the issue, because `color-scheme` only affects native UI rendering (scrollbars, form controls) and has no effect on `@media (prefers-color-scheme)` matching. The real, confirmed cause: `_includes/svg/logo.svg` (a custom, Inkscape-exported logo, kept as a local theme override) contains a leftover `<style>` block — apparently an Inkscape canvas-preview artifact baked into the export — reading `@media (prefers-color-scheme: light) { :root { filter: contrast(1) brightness(0.1); } } @media (prefers-color-scheme: dark) { :root { filter: none; } }`. Since this SVG is inlined directly into the page (not loaded as a standalone document), `:root` inside it resolves to the page's own `<html>` element, not the SVG — so this one small logo file applies a 90%-brightness-cut filter to the *entire page* whenever the visitor's system prefers light mode. This is real, deterministic, authored CSS (confirmed present in the served HTML itself, not something the browser injects), which is exactly why it reproduces identically and reliably across completely unrelated browsers/platforms.

The color-scheme/theme-color fix that already shipped is harmless, reasonable practice, and stays; it just wasn't the actual fix.

## What Changes

- **The actual fix**: remove the stray `<style id="style1">@media (prefers-color-scheme: light) {...} @media (prefers-color-scheme: dark) {...}</style>` block from `_includes/svg/logo.svg`. The logo renders identically without it (the block has no bearing on the SVG's own visual appearance in either the Inkscape editor or any legitimate rendering context) — it only exists as an editor-export artifact, and it's the sole cause of the site-wide over-darkening.
- (Already shipped, kept as good practice, not the actual fix): `<meta name="color-scheme" content="dark">` in the page `<head>`, the standard signal that tells a supporting browser "this page already implements a dark color scheme — don't apply your own automatic dark-mode darkening."
- Correct the `<meta name="theme-color">` tag, currently hardcoded to `#ffffff` (white) by the theme's stock `_includes/head/favicon.html` even though the site uses the `dark` skin (actual page background `#121212`). A mismatched `theme-color` is a related, secondary contributor to browsers misjudging the page's actual color scheme.
- Implementation: `<meta name="color-scheme" content="dark">` goes in a new local `_includes/head/custom.html` override — the theme's designated "add your own head content" extension point (currently an empty stub provided by the `remote_theme`, per the `migrate-to-theme-gem` change's established pattern of using the theme's own hooks rather than touching core theme dispatch files). **Correction found during implementation**: the theme's own `_includes/head/favicon.html` already emits a `theme-color` meta tag (the wrong, hardcoded `#ffffff` one) — adding a second `theme-color` tag via `custom.html` would leave two conflicting tags in `<head>` with undefined precedence across browsers. The correct fix is a local override of `_includes/head/favicon.html` itself (identical to the theme's version, with only that one line corrected to `#121212`), not an additional tag in `custom.html`.

## Capabilities

### New Capabilities
- `color-scheme-declaration`: The site's declaration of its own color scheme to browsers, so browser-level automatic dark-mode/forced-dark features don't double-darken an already-dark-themed page.

### Modified Capabilities
(none)

## Impact

- **Affected files**: new `_includes/head/custom.html` (currently deleted as an empty-stub duplicate of the theme's own empty default, per the theme-gem migration — this change reintroduces it locally, non-empty).
- **Affected systems**: none beyond the rendered `<head>` of every page.
- **User-facing**: fixes the over-darkened rendering on affected mobile browsers; on browsers without a force-dark feature, this change has no visible effect (the meta tags are inert for them).
- **No impact** to build/deploy pipeline, comments, or any other capability.
