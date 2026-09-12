## 1. Switch the theme consumption mechanism

- [x] 1.1 Add `remote_theme: kitian616/jekyll-TeXt-theme@v2.2.6` to `_config.yml` and add `jekyll-remote-theme` to the `plugins:` list
- [x] 1.2 Remove the `gem "jekyll-text-theme"` line from `Gemfile` and regenerate `Gemfile.lock` (`bundle install`); verify `jekyll-remote-theme` is present in the resolved lockfile

## 2. Remove confirmed-unmodified vendored theme files

- [x] 2.1 Delete every file under `_layouts/`, `_includes/`, `_sass/`, `_data/`, `assets/` with zero diff against the installed `jekyll-text-theme` 2.2.6 gem, per the design.md audit (187 files under `_layouts/`/`_includes/`/`_sass/`/`_data/`, plus `assets/search.js` and `assets/browserconfig.xml` found identical during implementation — not in the original design.md list, but confirmed byte-identical via `cmp`, so included) — **correction**: `_data/authors.yml` and `_data/licenses.yml` were initially deleted here but had to be restored (see design.md's "Correction found during implementation") since Jekyll doesn't merge `_data/` from a theme at all; only `_layouts/`/`_includes/`/`_sass/`/`assets/` actually needed the zero-diff rule
- [x] 2.2 Delete `_layouts/page.html` and `assets/css/main.scss` (confirmed non-functional-only diffs: self-closing-tag style, one inactive commented-out `@import`)
- [x] 2.3 Verify every file listed in design.md's "genuine customizations to keep" list is still present and untouched: `_layouts/404.html`, `_layouts/home.html`, `_includes/footer.html`, `_includes/article-list.html`, `_includes/tags.html`, `_includes/paginator.html`, `_includes/search-providers/default/search-data.js`, `_includes/comments-providers/custom.html`, `_includes/svg/logo.svg`, `_sass/common/components/_item.scss`, `_data/variables.yml`, `_data/locale.yml`, `_data/navigation.yml`, `_layouts/archive.html`, and the branding assets (`assets/images/logo/logo.svg`, `assets/favicon*`, `assets/apple-touch-icon.png`, `assets/mstile-70x70.png`, `assets/site.webmanifest`) — all 19 confirmed present

## 3. Verify via a real build (branch + PR, not local build)

- [x] 3.1 Push to a branch and open a PR; confirm the `build` GitHub Actions job succeeds and actually resolves the remote theme (check the build log for theme-download activity, not a silent fallback) — confirmed in the log: "Remote Theme: Downloading https://codeload.github.com/kitian616/jekyll-text-theme/zip/v2.2.6", "Theme: kitian616/jekyll-text-theme@v2.2.6" (PR #5, run https://github.com/vcasadei/vcasadei.github.io/actions/runs/34718333447)
- [x] 3.2 Download the built artifact from that PR run
- [x] 3.3 Also download (or reuse from a recent run) the built artifact from the current `master` `build`/`deploy` job as a "before" baseline
- [x] 3.4 Diff the two built `_site/` trees page-by-page (at minimum: homepage, archive, one post, the about page, the 404 page) and confirm no unexpected differences — expected/no-op differences (if any) must be explained, not just dismissed. **First pass found a real regression** (every post's CC-BY-NC-4.0 license notice missing — see the `_data/authors.yml`/`_data/licenses.yml` correction above); after fixing and re-running, every HTML page is byte-identical except `feed.xml`/`sitemap.xml` timestamps. Remaining explained no-op differences: `assets/css/style.css` (an orphaned file unreferenced by any page in *either* build, now no longer generated) and 9 new unreferenced favicon-variant files the theme provides that weren't present locally before (harmless additions, nothing links to them differently than before)
- [x] 3.5 Specifically confirm in the "after" build: the Space Invaders game still loads on the 404 page, the giscus comment widget still renders on a post, the homepage still shows cover images, the footer no longer shows the theme attribution line (unchanged from today), and the site's custom favicon/logo still appear (not the theme's generic placeholders) — all confirmed via the built HTML; also verified `favicon.ico`/`apple-touch-icon.png` (our custom branded files) are correctly referenced, while `favicon-16x16.png`/`favicon-32x32.png` referencing the theme's generic icons is pre-existing behavior (those exact paths were already referenced before this change despite never having local files there — not a regression)

## 4. Merge and confirm live

- [x] 4.1 Merge to `master`; confirm the `deploy` job succeeds (run https://github.com/vcasadei/vcasadei.github.io/actions/runs/34718679776)
- [x] 4.2 Load the live site and spot-check the same pages verified in 3.4/3.5 (homepage 200, license notice present on hello-world post, Space Invaders loads on 404, giscus embed present)
- [x] 4.3 Confirm `openspec validate migrate-to-theme-gem --strict` passes
