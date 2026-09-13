## Why

Several images on the site are large and uncompressed (`assets/images/` totals ~8.6MB; the biggest single file is 2.9MB), and none of the post-listing pages (home, archive) currently show a cover thumbnail at all, so there's no lightweight preview path today. Separately, 6 posts (in both languages) embed 18 inline images via absolute `raw.githubusercontent.com` URLs instead of local relative paths — these bypass Jekyll's asset pipeline entirely (they already point at files already committed in this repo, just addressed the wrong way, including two with an accidental backslash in the path) and so wouldn't benefit from any local optimization pipeline unless rewritten.

## What Changes

- Add an image-processing step to the existing GitHub Actions `build` job (before the Jekyll build step), which for every raster image under `assets/images/` (jpg/jpeg/png):
  - Re-compresses it in place (resized to a sane maximum width, quality-optimized) at its existing path/format — this is what actually gets deployed; the resize/compress happens only in the CI runner's own checkout and is never committed back to the repository, so the original files in git history are untouched ("maintain the original images as well").
  - Generates a `.webp` sibling at the same path (e.g. `foo.jpeg` → `foo.webp`), similarly compressed.
  - Generates a small thumbnail variant (both in the original format and `.webp`, e.g. `foo-thumb.jpeg` / `foo-thumb.webp`) sized for listing use.
- Rewrite the 6 affected posts' inline image links from their absolute `raw.githubusercontent.com` URLs to local relative paths pointing at the new `.webp` sibling (also fixing the two accidental-backslash paths as a side effect).
- Enable cover-image display on the home page listing (currently `show_cover: false`, so no covers show there today), using the new thumbnail variant via a `<picture>` element (`.webp` source, original-format fallback).
- No change to individual post pages' own hero/header images (`article_header.background_image`) beyond them being served from the re-compressed original — no `<picture>`/webp swap there, since it's a CSS `background-image`, not an `<img>`.

## Capabilities

### New Capabilities
- `image-asset-pipeline`: automated, build-time image optimization (recompression, WebP conversion, thumbnail generation) for the site's image assets, and how templates/content consume the generated variants.

### Modified Capabilities
- `site-build-pipeline`: the `build` job gains an image-processing step that runs before the Jekyll build.

## Impact

- **Affected files**: `.github/workflows/deploy.yml` (new build step); the 6 posts with `raw.githubusercontent.com` inline image links (EN: `2024-09-13-upgrading-network-and-security-cameras.md`, `2024-09-20-improving-home-security-using-ai copy.md`, `2026-09-11-local-personal-assistant-hacktown-2026.md`; PT counterparts); `index.html` (enable `show_cover`); `_includes/article-list.html` (thumbnail `<picture>` markup for the home listing's cover image).
- **Affected systems**: the `build` job's runtime grows (image processing takes some extra seconds) but the job's actual Jekyll-build mechanism is unchanged — this proposal does not depend on or require the separately-proposed `paginate-posts-by-language` change (which replaces the Jekyll build step itself); both can land independently, in either order.
- **No impact** to `pt/index.html`, `archive.html`, or `pt/arquivo.html` — those use the `brief`/text-only listing style, which has no cover-image support today; adding it there is not part of this change unless requested.
- **Content-authorship note**: none — this is a mechanical link-rewrite (same images, corrected paths/extension) and a build-tooling addition, not new authored content.
