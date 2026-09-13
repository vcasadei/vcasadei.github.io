## 1. Add the image-processing build step

- [ ] 1.1 Add a step to `.github/workflows/deploy.yml`'s `build` job, before the existing Jekyll build step, that installs `imagemagick` and `webp` (`apt-get install -y imagemagick webp`); verify the workflow YAML is valid
- [ ] 1.2 In that step, for every `.jpg`/`.jpeg`/`.png` under `assets/images/`: recompress it in place (`convert` capped at 1600px longest edge, quality 82) at its existing path, and generate a `.webp` sibling at the same path via `cwebp` (quality 80); verify a sample recompressed file is smaller than its git-committed original and its `.webp` sibling exists
- [ ] 1.3 In the same step, for every image used as a post `cover:` (the 6 files listed in task group 2 below), also generate a `-thumb` variant (480px wide, quality 78) in both the original format and `.webp`; verify all 12 thumbnail files (6 covers × 2 formats) are produced
- [ ] 1.4 Confirm the step only modifies the runner's own checkout, never commits back to the repository — no task-level check needed beyond code review, since the step has no `git commit`/`push` of its own

## 2. Enable and render home-listing thumbnails

- [ ] 2.1 Enable `show_cover: true` (and `cover_size` if a size other than the include's default is wanted) in `index.html`'s `articles:` front matter
- [ ] 2.2 Update `_includes/article-list.html`'s `item` render type: replace the plain `<img class="image" src="{{ _article_cover }}" />` with a `<picture>` block offering the `-thumb.webp` variant first and the `-thumb.{original extension}` variant as the `<img>` fallback, deriving both paths from `_article.cover` via Liquid string manipulation; verify the rendered markup for a sample post's cover derives the expected two thumbnail paths

## 3. Rewrite inline post images to local WebP paths

- [ ] 3.1 In `_posts/2024-09-13-upgrading-network-and-security-cameras.md` and its PT counterpart: rewrite both `raw.githubusercontent.com` image links (already `.webp` source files) to local relative paths (`/assets/images/d1d3b31f-...webp`, `/assets/images/e176889e-...webp`)
- [ ] 3.2 In `_posts/2024-09-20-improving-home-security-using-ai copy.md` and its PT counterpart: rewrite all 6 `raw.githubusercontent.com` image links to local relative `.webp` paths (`/assets/images/home-security-ai/1.webp`, `2.webp`, `3.webp`, `4.webp`, `camera-grid.webp`, `cctv-grid.webp`), fixing the two backslash-path links (`home-security-ai\camera-grid.png`, `home-security-ai\cctv-grid.jpeg`) in the process
- [ ] 3.3 In `_posts/2026-09-11-local-personal-assistant-hacktown-2026.md` and its PT counterpart: rewrite the `raw.githubusercontent.com` logo image link to a local relative `.webp` path (`/assets/images/local-personal-assistant-hacktown-2026/hacktown-2026-logo-10anos-branco.webp`)
- [ ] 3.4 Grep all 6 posts for any remaining `raw.githubusercontent.com` reference; verify zero remain

## 4. Verify via a real build (branch + PR)

- [ ] 4.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes, and that its logs show the image-processing step actually running (not skipped)
- [ ] 4.2 Download the built artifact and check: recompressed images are present and smaller than their git-committed originals; every processed image has a `.webp` sibling; every cover image has both `-thumb` variants; the home page's `<picture>` markup for a sample post points at real, existing thumbnail files in the artifact; the rewritten inline post images resolve to real files in the artifact
- [ ] 4.3 Confirm no unrelated pages regressed (diff a sample of untouched pages against a master build)
- [ ] 4.4 Merge to `master`; confirm the `deploy` job succeeds

## 5. Confirm live

- [ ] 5.1 Load the home page live and confirm each post's thumbnail loads (check the network tab or response headers for the `.webp` thumbnail, not the full-size cover)
- [ ] 5.2 Load the 3 affected English posts and their PT counterparts live and confirm every inline image renders correctly
- [ ] 5.3 Spot-check that a recompressed image's live file size is meaningfully smaller than its git-committed original
- [ ] 5.4 Confirm `openspec validate optimize-website-images --strict` passes
