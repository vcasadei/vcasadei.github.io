## Why

There's currently no supported, documented way to turn comments off for one specific post (e.g. a post the author doesn't want discussion on). The underlying jekyll-TeXt-theme already reads a `comment` front-matter key per page (`page.comment`) to override the site-wide default, but no post in this repo uses it, and it isn't documented anywhere — so it's effectively an undiscovered, unverified capability rather than a supported feature.

## What Changes

- Document the existing `comment: false` front-matter key in `docs/writing-posts.md` and `docs/post-features.md` as the supported way to disable comments on an individual post.
- Comments remain ON by default for posts (no change to existing posts); an author adds `comment: false` to a specific post's front matter to opt that post out.
- Verify the mechanism actually works end-to-end with the current giscus setup (not just in theory).

## Capabilities

### Modified Capabilities
- `blog-comments`: Adds a requirement that an individual post can opt out of comments via front matter, on top of the site-wide default.

## Impact

- Affected files: `docs/writing-posts.md`, `docs/post-features.md` (documentation only).
- No code change — the mechanism already exists in the theme (`_layouts/page.html` / `layout.comment` / `page.comment` resolution, default `true`). This change makes it documented and verified, not newly built.
