## Why

Comments currently render on every page built on the theme's `page`/`article` layout, not just blog posts — including the About page, the Archive page, the Home page, and even the 404 page — because the theme's default (`comment: true`) applies unless a page opts out. A giscus comment thread doesn't make sense on these non-post pages (there's no article to discuss, and each would map to its own empty GitHub Discussion). Comments should only appear on actual blog posts.

## What Changes

- Set `comment: false` in front matter for: `about.md`, `archive.html`, `index.html` (Home page), and `_layouts/404.html`, so the theme's existing per-page override suppresses the comments section on each.
- No change to blog posts — they keep the theme's default (`comment: true`) and continue to render comments.

## Capabilities

### Modified Capabilities
- `blog-comments`: Adds a requirement that comments are scoped to blog posts only, not shown on non-post pages.

## Impact

- Affected files: `about.md`, `archive.html`, `index.html`, `_layouts/404.html` (front matter only — one line each).
- No change to the giscus configuration, provider hook, or post front matter.
