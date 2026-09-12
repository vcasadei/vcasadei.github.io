## Why

On some mobile browsers (e.g. Samsung Internet, other Chromium-based Android browsers with a "Dark mode for web contents" / force-dark feature), the entire site renders almost black — text and background alike crushed to near-illegibility. Inspecting the page confirms the actual mechanism: a browser-injected rule, `@media (prefers-color-scheme: light) { :root { filter: contrast(1) brightness(0.1); } }`, applies a 90%-brightness-reduction filter to the whole page. This rule does not exist anywhere in this site's own CSS (confirmed: absent from the built `main.css`) — it's the browser's own automatic dark-mode heuristic kicking in because the site never tells the browser it already implements its own dark appearance. The browser sees a device set to light mode, assumes the page needs "helping" toward dark, and applies a blunt brightness filter on top of a page that's already dark-themed — producing a double-darkened, barely-readable result.

## What Changes

- Add `<meta name="color-scheme" content="dark">` to the page `<head>`, the standard signal that tells a supporting browser "this page already implements a dark color scheme — don't apply your own automatic dark-mode darkening."
- Correct the `<meta name="theme-color">` tag, currently hardcoded to `#ffffff` (white) by the theme's stock `_includes/head/favicon.html` even though the site uses the `dark` skin (actual page background `#121212`). A mismatched `theme-color` is a related, secondary contributor to browsers misjudging the page's actual color scheme.
- Implementation goes in a new local `_includes/head/custom.html` override — the theme's designated "add your own head content" extension point (currently an empty stub provided by the `remote_theme`, per the `migrate-to-theme-gem` change's established pattern of using the theme's own hooks rather than touching core theme dispatch files).

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
