## Why

This repo is a fork of the jekyll-TeXt-theme project, and still carries a large amount of upstream theme-authoring scaffolding that has nothing to do with this blog: a 14MB theme demo/docs site, an 11MB theme screenshots folder, theme test fixtures, theme release/lint tooling, and Docker configs for running the theme's own demo. None of it is served by the live site (`_config.yml`'s `exclude:` list already keeps most of it out of the Jekyll build), but it clutters the repo, adds noise to every `git status`/diff/search, and makes it harder for anyone (including future-me) to tell "the blog" apart from "the theme project this was forked from."

## What Changes

- Delete the following upstream theme-project artifacts, none of which affect the built site (all already excluded from the Jekyll build, or never referenced by it):
  - `docs/` — the theme's own demo/documentation site (14MB)
  - `screenshots/` — theme marketing screenshots (11MB)
  - `test/` — theme test fixtures/specs
  - `tools/` — theme release helper scripts (`assert-url.js`, `diff.sh`, `dir-tree.sh`)
  - `README.md`, `README-zh.md` — upstream theme README (English/Chinese)
  - `CHANGELOG.md`, `HOW_TO_RELEASE.md` — theme project release process docs
  - `jekyll-text-theme.gemspec` — gemspec for publishing the theme to RubyGems (this fork will never do that)
  - `docker/` (all `docker-compose.*.yml`, `nginx.conf`) and `Dockerfile.dev` — confirmed unused; local dev now goes through a plain Ruby install (see the `add-github-actions-deploy` change), not Docker
- Remove the now-dangling entries for these paths from `_config.yml`'s `exclude:` list (`CHANGELOG.md`, `HOW_TO_RELEASE.md`, `README-*.md`, `README.md`, `jekyll-text-theme.gemspec`, `/docs`, `/screenshots`, `/test`), since excluding a path that no longer exists is dead configuration.
- Leave `LICENSE` in place — the theme's own layouts/includes/Sass are still vendored in this repo (`_layouts/`, `_includes/`, `_sass/`), so its MIT license still applies and should stay attributed regardless of this cleanup.
- Not in scope: `package.json`, `Gemfile`, and related lint/build config (`.eslintrc`, `.stylelintrc`, `.commitlintrc.js`, etc.) are also largely theme-authoring tooling (several `package.json` scripts — `docker-dev:*`, `demo-*`, `gem-build`, `gem-push` — will become dead references once `docker/`/`docs/` are gone), but pruning those is a separate, smaller follow-up rather than bundled into this cleanup.

## Capabilities

(none — this is a pure repository/tooling cleanup with no effect on the site's built output or observable behavior; `.openspec.yaml` for this change sets `skip_specs: true`)

## Impact

- **Affected files**: deletion of `docs/`, `screenshots/`, `test/`, `tools/`, `README.md`, `README-zh.md`, `CHANGELOG.md`, `HOW_TO_RELEASE.md`, `jekyll-text-theme.gemspec`, `docker/`, `Dockerfile.dev`; edit to `_config.yml`'s `exclude:` list.
- **Affected systems**: none — GitHub Pages/Actions build is unaffected since all removed paths were already excluded from the Jekyll build or unreferenced by it.
- **Repo size**: removes roughly 25MB of tracked files (mostly `docs/` and `screenshots/`), though full repo/`.git` size only shrinks once history is also pruned (not part of this change — these files remain in git history).
- **No impact** to posts, layouts, comments, CI/CD, or the Space Invaders 404 page.
- **Follow-up flagged, not included**: `package.json` and its lint/build scripts become partially dead once `docker/`/`docs/` are removed; left as a separate future cleanup.
