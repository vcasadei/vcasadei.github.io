## 1. Remove upstream theme scaffolding

- [x] 1.1 Delete `docs/`, `screenshots/`, `test/`, `tools/` and verify with `git status` that all four are staged as deletions
- [x] 1.2 Delete `README.md`, `README-zh.md`, `CHANGELOG.md`, `HOW_TO_RELEASE.md`, `jekyll-text-theme.gemspec` and verify they no longer exist at repo root
- [x] 1.3 Delete `docker/` and `Dockerfile.dev` and verify they no longer exist

## 2. Clean up dangling config

- [x] 2.1 Remove the now-dangling `exclude:` entries in `_config.yml` for the deleted paths (`CHANGELOG.md`, `HOW_TO_RELEASE.md`, `README-*.md`, `README.md`, `jekyll-text-theme.gemspec`, `/docs`, `/screenshots`, `/test`) and verify the file still parses as valid YAML
- [x] 2.2 Confirm `LICENSE` was NOT removed (it still applies to the vendored theme code in `_layouts/`/`_includes/`/`_sass/`)

## 3. Verify nothing broke

- [ ] 3.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check still passes
- [ ] 3.2 Download the built artifact from that PR run (or check the live site after merge) and confirm the homepage, archive, and at least one post still render correctly
- [ ] 3.3 Merge to `master` and confirm the `deploy` job succeeds and the live site is unaffected
