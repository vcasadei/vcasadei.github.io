## 1. Switch the theme consumption mechanism

- [x] 1.1 Add `remote_theme: kitian616/jekyll-TeXt-theme@v2.2.6` to `_config.yml` and add `jekyll-remote-theme` to the `plugins:` list
- [x] 1.2 Remove the `gem "jekyll-text-theme"` line from `Gemfile` and regenerate `Gemfile.lock` (`bundle install`); verify `jekyll-remote-theme` is present in the resolved lockfile

## 2. Remove confirmed-unmodified vendored theme files

- [x] 2.1 Delete every file under `_layouts/`, `_includes/`, `_sass/`, `_data/`, `assets/` with zero diff against the installed `jekyll-text-theme` 2.2.6 gem, per the design.md audit (187 files under `_layouts/`/`_includes/`/`_sass/`/`_data/`, plus `assets/search.js` and `assets/browserconfig.xml` found identical during implementation — not in the original design.md list, but confirmed byte-identical via `cmp`, so included)
- [x] 2.2 Delete `_layouts/page.html` and `assets/css/main.scss` (confirmed non-functional-only diffs: self-closing-tag style, one inactive commented-out `@import`)
- [x] 2.3 Verify every file listed in design.md's "genuine customizations to keep" list is still present and untouched: `_layouts/404.html`, `_layouts/home.html`, `_includes/footer.html`, `_includes/article-list.html`, `_includes/tags.html`, `_includes/paginator.html`, `_includes/search-providers/default/search-data.js`, `_includes/comments-providers/custom.html`, `_includes/svg/logo.svg`, `_sass/common/components/_item.scss`, `_data/variables.yml`, `_data/locale.yml`, `_data/navigation.yml`, `_layouts/archive.html`, and the branding assets (`assets/images/logo/logo.svg`, `assets/favicon*`, `assets/apple-touch-icon.png`, `assets/mstile-70x70.png`, `assets/site.webmanifest`) — all 19 confirmed present

## 3. Verify via a real build (branch + PR, not local build)

- [ ] 3.1 Push to a branch and open a PR; confirm the `build` GitHub Actions job succeeds and actually resolves the remote theme (check the build log for theme-download activity, not a silent fallback)
- [ ] 3.2 Download the built artifact from that PR run
- [ ] 3.3 Also download (or reuse from a recent run) the built artifact from the current `master` `build`/`deploy` job as a "before" baseline
- [ ] 3.4 Diff the two built `_site/` trees page-by-page (at minimum: homepage, archive, one post, the about page, the 404 page) and confirm no unexpected differences — expected/no-op differences (if any) must be explained, not just dismissed
- [ ] 3.5 Specifically confirm in the "after" build: the Space Invaders game still loads on the 404 page, the giscus comment widget still renders on a post, the homepage still shows cover images, the footer no longer shows the theme attribution line (unchanged from today), and the site's custom favicon/logo still appear (not the theme's generic placeholders)

## 4. Merge and confirm live

- [ ] 4.1 Merge to `master`; confirm the `deploy` job succeeds
- [ ] 4.2 Load the live site and spot-check the same pages verified in 3.4/3.5
- [ ] 4.3 Confirm `openspec validate migrate-to-theme-gem --strict` passes
