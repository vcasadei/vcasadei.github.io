## Context

`assets/images/` is ~8.6MB across ~16 files, some individually large (2.9MB, 1.4MB, several 300-900KB) — these are used as post `cover:`/`article_header.background_image` hero images. No listing page currently shows a cover image at all: `index.html`/`pt/index.html` (home) default to `show_cover: false`, and `archive.html`/`pt/arquivo.html` use `article-list.html`'s `brief` render type, which has no cover-image branch at all. Separately, 6 post files (3 English + their 3 Portuguese translations) embed 18 inline images via absolute `https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/...` URLs — these already point at files committed in this same repo, just addressed the wrong way (two of them even have a literal backslash instead of a forward slash in the path, e.g. `home-security-ai\camera-grid.png`, apparently pasted from a Windows path and never corrected).

The build runs via `.github/workflows/deploy.yml`'s `build` job, currently a single `actions/jekyll-build-pages` step (see `paginate-posts-by-language`'s research: that action bundles its own fixed `github-pages` gem environment and only reads this repo's `Gemfile` to print a compatibility warning). This proposal does **not** need to touch that step at all — image processing can run as a plain shell step earlier in the same job, operating on files in the runner's own checkout before Jekyll ever runs; Jekyll then just copies the (now already-optimized) files into `_site` like any other static asset. This keeps this proposal fully independent of `paginate-posts-by-language`'s build-step replacement — both can land in either order.

## Goals / Non-Goals

**Goals:**
- Every deployed raster image is recompressed and has a WebP sibling, without touching the source files committed to git.
- A small thumbnail (both formats) exists per cover image, and the home page listing uses it via `<picture>` instead of loading full-size covers (which it doesn't load today at all — this is a new capability, not a regression fix).
- The 6 posts' inline images move off absolute `raw.githubusercontent.com` URLs onto local, WebP-optimized paths.

**Non-Goals:**
- No change to `pt/index.html`/`archive.html`/`pt/arquivo.html`'s listing style (they don't show covers today; adding that is a separate future decision).
- No `<picture>`/WebP treatment for post hero/header background images (`article_header.background_image`) — those are CSS `background-image`, not `<img>`, and don't have a clean picture-element equivalent; they only benefit from the recompression step, not the WebP swap.
- No dependency on, or coupling with, `paginate-posts-by-language`'s build-step replacement.
- No responsive `srcset` (multiple thumbnail sizes) — one thumbnail size is enough for the current single-column-card listing use case; can be revisited if the listing layout changes.

## Decisions

**Tooling**: `imagemagick` (`convert`) for in-place recompression/resizing of the original-format image, and the `webp` package's `cwebp` for explicit, well-controlled WebP encoding (rather than relying on ImageMagick's own WebP delegate, whose presence/quality options are less predictable across runner images) — both installed via `apt-get install -y imagemagick webp` in the new build step, no third-party GitHub Action added (keeps the trust surface limited to first-party `actions/*` steps already used elsewhere in this workflow, plus standard Ubuntu packages).

**Sizing/quality**: recompressed full-size images capped at 1600px on the longest edge, quality 82 (JPEG) — well above what any current display width needs while meaningfully shrinking the largest files; WebP full-size at quality 80; thumbnails capped at 480px wide, quality 78 (both formats) — sized for a listing card, not a full read.

**File naming**: full-size recompression overwrites the image in place at its existing path (same filename/extension) — this only ever happens in the CI runner's disposable checkout, never committed back, so the git-tracked source is untouched. The WebP sibling is the same path with `.webp` substituted for the original extension (`foo.jpeg` → `foo.webp`). Thumbnails get a `-thumb` suffix before the extension (`foo.jpeg` → `foo-thumb.jpeg`, `foo-thumb.webp`).

**Home listing thumbnail markup**: in `_includes/article-list.html`'s `item` render type (used by `index.html`), replace the existing `<img class="image" src="{{ _article_cover }}" />` with a `<picture>` block: a `<source type="image/webp" srcset="{cover-thumb.webp path}">` plus a fallback `<img src="{cover-thumb.jpeg-or-png path}">`. The thumbnail path is derived from `_article.cover` by inserting the `-thumb` suffix before the extension for the fallback, and swapping the extension to `.webp` with the same suffix for the WebP source — pure string manipulation in Liquid (`split`/`join` on `.`), no new front-matter field needed since the thumbnail's existence is guaranteed by the build step for every `cover` image.

**Inline post images**: rewrite each affected post's `![...](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/...)` links to `![...](/assets/images/...)`, fixing the two backslash paths in the process, and change the extension to `.webp` (the underlying original-format file still exists too, generated by the same build step, but Markdown's `![]()` syntax can't express a `<picture>` fallback — direct-linking the WebP variant is the pragmatic choice given universal evergreen-browser WebP support; this is a stronger tradeoff than the home-listing case, where a real `<picture>` fallback is easy because that markup is Liquid-controlled, not hand-authored Markdown).

## Risks / Trade-offs

- [`cwebp`/`convert` recompressing every image on every single build adds CI time] → Acceptable for the current image count (~16 files, no per-build cache needed yet); revisit with a content-hash-keyed cache step if the image set grows enough to matter.
- [Direct-linking `.webp` for inline post images means no fallback for a browser without WebP support] → Accepted: evergreen browser WebP support has been effectively universal for years; the underlying original-format file still exists on disk (generated, not deleted) if a future need for a fallback arises.
- [Recompression happens fresh in every CI run rather than being reviewable in a PR diff, since the optimized bytes never reach git] → Accepted per the "maintain the original images as well" requirement — the tradeoff is intentional: what's reviewable in git is the true source image, and what's live is a build artifact of it.

## Migration Plan

1. Add the image-processing step to `.github/workflows/deploy.yml`'s `build` job, before the existing Jekyll build step.
2. Update `_includes/article-list.html`'s `item` type to render the thumbnail `<picture>` markup.
3. Enable `show_cover: true` (with `cover_size` as appropriate) in `index.html`'s `articles:` front matter.
4. Rewrite the 6 affected posts' inline image links.
5. Verify via a real build (branch + PR, per this repo's established practice): confirm the build step actually runs and produces smaller/WebP/thumbnail files in the artifact, confirm the home listing renders thumbnails via `<picture>`, confirm the rewritten inline post images load correctly, and confirm original files in git are unchanged (`git status` clean after the workflow — nothing to check here since the processing never touches the git working tree used for the PR itself, only the ephemeral build).
