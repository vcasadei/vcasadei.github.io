## Why

This repo carries a full, byte-for-byte copy of the jekyll-TeXt-theme's `_layouts/`, `_includes/`, `_sass/`, `_data/`, and `assets/` — but the `jekyll-text-theme` gem is *already* in `Gemfile` and already installed; it's just silently shadowed, since Jekyll always prefers a local file over the same path from a theme. Every future upstream theme update currently means manually diffing and re-merging the entire vendored tree by hand. Consuming the theme as a dependency instead — keeping only the handful of files we've actually customized — turns future updates into a version bump instead of a manual merge, and makes it obvious at a glance which files are "our" customizations versus "theme" code.

## What Changes

- Switch from a fully-vendored theme to `remote_theme: kitian616/jekyll-TeXt-theme` in `_config.yml`. **Not** the plain Jekyll `theme:` gem mechanism: `github-pages`'s dependency manifest only bundles a small fixed allowlist of `jekyll-theme-*` gems (primer, slate, cayman, etc.) — `jekyll-text-theme` isn't one of them, so `theme: jekyll-text-theme` would not resolve inside the GitHub-Pages-compatible build our Actions workflow uses. `jekyll-remote-theme`, on the other hand, *is* in that allowlist (confirmed: it's a direct dependency of the installed `github-pages` gem) — it's specifically GitHub's supported escape hatch for using a theme that isn't on the allowlist.
- Remove the now-redundant `gem "jekyll-text-theme"` line from `Gemfile` — `remote_theme` fetches the theme from GitHub at build time, not via RubyGems/Bundler.
- Delete every locally-vendored theme file that is an unmodified (or only trivially, non-functionally different) copy of what the theme provides, keeping only files we've verified are genuinely customized. Jekyll's theme resolution means any file still present locally at the same path continues to override the remote theme's copy, so customized files keep working with zero code change — only the *set* of files we keep locally shrinks.
- Confirmed customized files to keep as local overrides (verified by diffing against the published gem — see design.md for the full audit and its caveats):
  - `_layouts/404.html` (the Space Invaders 404 game)
  - `_layouts/home.html` (`show_cover: true`, vs. the theme's `false` default)
  - `_includes/footer.html` (removes the "Powered by Jekyll & TeXt Theme" attribution line)
  - `_includes/article-list.html`, `_includes/tags.html`, `_includes/paginator.html`, `_includes/search-providers/default/search-data.js` (the `hide_from_index` support added for multi-language posts)
  - `_includes/comments-providers/custom.html` (the giscus embed)
  - `_includes/svg/logo.svg`, `assets/images/logo/logo.svg`, `assets/favicon*`, `assets/apple-touch-icon.png`, `assets/mstile-70x70.png`, `assets/site.webmanifest` (custom branding/favicon assets)
  - `_sass/common/components/_item.scss` (a small layout tweak to centered image display)
  - `_data/variables.yml` (CDN source version bumps, `highlight_theme` default, `show_excerpt`/`show_readmore`/`show_info` defaults)
  - `_data/locale.yml`, `_data/navigation.yml`, `_layouts/archive.html` (a bumped `COPYRIGHT_DATES` year, plus hand-added Turkish-locale strings)
- Confirmed the published `jekyll-text-theme` gem (2.2.6) **is** the upstream theme's latest tag (`v2.2.6`, unchanged since Feb 2020) — so `remote_theme: kitian616/jekyll-TeXt-theme@v2.2.6` fetches byte-identical content to what the gem ships, and every diff found against the gem is a real, deliberate local change, not stale-gem-vs-newer-upstream noise. This means the Turkish-locale additions above are genuine customizations to keep, not upstream drift to discard.
- Confirmed safe to delete outright (differ from the gem only in a way with zero functional effect): `_layouts/page.html` (a `<img ... />` vs. `<img...></img>` self-closing-tag style difference — identical rendering) and `assets/css/main.scss` (differs only by one commented-out, inactive `@import` line).
- Everything else under `_layouts/`, `_includes/`, `_sass/`, `_data/`, `assets/` that has zero diff against the gem gets deleted outright.

## Capabilities

### New Capabilities
- `theme-integration`: How this site consumes the jekyll-TeXt-theme — as a `remote_theme` dependency rather than fully vendored source, with only genuinely-customized files kept locally as overrides — and the constraint that this consumption model must not change the site's rendered output or behavior.

### Modified Capabilities
(none)

## Impact

- **Affected files**: `_config.yml` (`remote_theme:` added, `plugins:` gets `jekyll-remote-theme`), `Gemfile` (`jekyll-text-theme` gem removed), deletion of the large majority of `_layouts/`, `_includes/`, `_sass/`, `_data/`, `assets/` (everything not listed above as a confirmed or candidate override).
- **Affected systems**: GitHub Actions build (must confirm `actions/jekyll-build-pages` resolves `remote_theme` correctly — this is the main open risk, covered in design.md).
- **Depends on**: the separate `remove-vendored-theme-scaffolding` change (docs/, test/, screenshots/, tools/, READMEs, etc.) — unrelated file set, no ordering dependency, but both shrink the same "vendored theme footprint" problem.
- **No impact** to posts, comments configuration, or CI/CD deploy behavior beyond the theme-resolution mechanism itself.
- **Risk profile**: higher than the scaffolding-removal cleanup — this touches the actual rendering pipeline (layouts/includes/sass), so a missed customization would be a real visual/functional regression, not just repo clutter. Verification strategy (diff the built site before/after) is covered in design.md.
