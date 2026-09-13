## Why

Visiting a non-existent post URL (e.g. `/2026/09/11/local-personal-assistant-hacktown-2025`, four path segments deep) makes the custom 404 page appear to load repeatedly/recursively. The embedded Space Invaders game uses a relative iframe `src="assets/space-invaders"`, which the browser resolves against the current (non-existent, deep) URL rather than the site root. That resolved path also doesn't exist, so GitHub Pages serves the same 404 page content again inside the iframe — which itself contains another relative iframe that resolves one level deeper and 404s again, producing a visible cascade of nested 404 pages. Shallow 404 URLs (one path segment) mostly hide the bug by coincidence, which is why it wasn't caught earlier.

## What Changes

- Change the 404 page's embedded game iframe to use a root-relative path (respecting `site.baseurl`) instead of a bare relative path, so it resolves the same way regardless of how deep the requested (non-existent) URL is.

## Capabilities

### New Capabilities
- `custom-404-page`: Defines the behavior of the site's custom 404 page, including that its embedded game asset must load correctly regardless of the depth of the requested (non-existent) URL, and must not recursively re-trigger the 404 page.

### Modified Capabilities
(none — no existing capability covers the 404 page's own behavior; `theme-integration` only covers *that* the 404 page is kept as a local override, not its internal correctness)

## Impact

- Affected file: `_layouts/404.html` (iframe `src` attribute).
- No impact to other pages, the comments system, or the build pipeline.
