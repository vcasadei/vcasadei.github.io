## Context

See `proposal.md` - Why. Relevant current state, established by direct investigation (diffing this repo's `_layouts/`, `_includes/`, `_sass/`, `_data/`, `assets/` against the installed `jekyll-text-theme` 2.2.6 gem):

- `Gemfile` already has `gem "jekyll-text-theme"`, resolved to 2.2.6 — but it's entirely unused, since every file it would provide is shadowed by an identical-path local file.
- `jekyll-text-theme` 2.2.6 (the gem) is byte-identical to the upstream repo's `v2.2.6` tag, which is also its *latest* tag (unchanged since February 2020). This matters: it means the gem is a completely faithful, current stand-in for what `remote_theme` would fetch — there's no "stale gem vs. newer upstream" ambiguity to worry about.
- No file exists locally that doesn't also exist at the same path in the gem — nothing would be silently lost by removing local files that have zero diff against the gem.
- Full diff results (local vs. gem 2.2.6), used to classify every differing file:
  - **Genuine customizations to keep as local overrides**: `_layouts/404.html` (Space Invaders 404 game), `_layouts/home.html` (`show_cover: true` vs. the theme's `false`, plus a Turkish nav-label line), `_includes/footer.html` (theme attribution line removed), `_includes/article-list.html`/`_includes/tags.html`/`_includes/paginator.html`/`_includes/search-providers/default/search-data.js` (the `hide_from_index` support from the earlier Portuguese-post change), `_includes/comments-providers/custom.html` (giscus embed), `_includes/svg/logo.svg` + `assets/images/logo/logo.svg` + `assets/favicon*` + `assets/apple-touch-icon.png` + `assets/mstile-70x70.png` + `assets/site.webmanifest` (custom branding), `_sass/common/components/_item.scss` (centered-image tweak), `_data/variables.yml` (CDN version bumps + defaults), `_data/locale.yml` + `_data/navigation.yml` + `_layouts/archive.html` (bumped copyright year + hand-added Turkish translations).
  - **Confirmed no-op, safe to delete**: `_layouts/page.html` (self-closing-tag style only), `assets/css/main.scss` (one inactive commented-out `@import`).
  - **Everything else** in those five directories: zero diff, safe to delete.
- **Correction found during implementation**: Jekyll's theme mechanism (`theme:` or `remote_theme:` alike) only merges `_layouts/`, `_includes/`, `_sass/`, and `assets/` from a theme — **not `_data/`**. A local `_data/*.yml` file with zero diff against the gem is *not* safe to delete the way a zero-diff `_layouts`/`_includes`/`_sass`/`assets` file is, since there is no fallback merge for it at all; deleting it makes that data simply disappear. This was caught by the PR build/diff verification in tasks.md: deleting `_data/licenses.yml` (byte-identical to the gem) silently dropped the CC-BY-NC-4.0 license notice from every post, since `_includes/article-footer.html` reads `site.data.licenses`. `_data/authors.yml` (also deleted, also byte-identical) is unused today (`show_author_profile: false`) but restored for the same reason — correctness here shouldn't depend on which data file happens to currently be read. Both are restored as local files despite being identical to the gem's copies; the "zero diff = safe to delete" rule from this design applies only to `_layouts/`, `_includes/`, `_sass/`, and `assets/`, not `_data/`.
- GitHub Pages' supported-themes allowlist (mirrored by `actions/jekyll-build-pages`, confirmed via the `github-pages` gem's own dependency manifest) only bundles a fixed set of `jekyll-theme-*` gems (primer, slate, cayman, dinky, hacker, leap-day, time-machine, midnight, minimal, modernist, tactile, architect, merlot) — `jekyll-text-theme` is not among them. `jekyll-remote-theme`, however, *is* a direct dependency of `github-pages` — confirmed installed locally as `jekyll-remote-theme-0.4.3` — making it the correct, already-supported mechanism for a non-allowlisted theme.
- `jekyll-remote-theme` supports pinning to a specific ref via `owner/repo@ref` syntax (branch, tag, or commit SHA) — confirmed in its source (`REF_REGEX` in `lib/jekyll-remote-theme/theme.rb`).

## Goals / Non-Goals

**Goals:**
- Consume the theme as a dependency (`remote_theme`), not vendored source, so future theme updates are a config change instead of a manual file-by-file merge.
- Zero observable change to the site's rendered output or behavior — every current customization keeps working.
- Keep the build reproducible: pin `remote_theme` to an exact tag, not a floating branch.

**Non-Goals:**
- Upgrading to a newer theme version — there isn't one; `v2.2.6` is the latest tag, so this is a pure consumption-mechanism change, not a version bump.
- Touching the vendored-scaffolding cleanup (`docs/`, `test/`, `screenshots/`, etc.) — that's the separate `remove-vendored-theme-scaffolding` change.
- Re-evaluating whether each customization (Turkish locale strings, removed attribution line, etc.) is still wanted — this change preserves current behavior exactly; changing any of that is a separate, future decision.

## Decisions

**Use `remote_theme: kitian616/jekyll-TeXt-theme@v2.2.6`, not the plain `theme:` gem mechanism.**
`theme: jekyll-text-theme` would not resolve inside the GitHub-Pages-compatible build environment our Actions workflow uses, since that theme isn't in the fixed allowlist `github-pages` bundles. `remote_theme` is GitHub's own supported escape hatch for exactly this case, and it's already an available dependency — no new plugin to add beyond listing it in `plugins:`.

**Pin to the `@v2.2.6` tag explicitly, not `kitian616/jekyll-TeXt-theme` alone (which would float to the repo's default branch).**
Matches the "build is reproducible" requirement already established for this site (`site-build-pipeline` capability) — an unpinned `remote_theme` would mean the theme's behavior could change out from under the site on a future rebuild with no corresponding commit here. Since `v2.2.6` is also the exact version already in use (as the gem), this pin changes nothing about current behavior while fixing it in place.

**Classify every local file by diffing against the gem, keep only files with a genuine functional difference.**
Rejected alternative: keep the full local tree "just in case." That's the exact problem this change exists to fix — an unaudited full copy makes it impossible to tell customization from cruft. Because the gem is confirmed identical to the exact tag `remote_theme` will fetch, the diff performed for this design is authoritative, not just indicative — no further guessing needed at implementation time, only re-verification via the build/deploy check in tasks.md.

**Verify via a real build/deploy, not local `bundle exec jekyll build`.**
Local Jekyll builds are already known-broken in this environment (Ruby 4.0 vs. an old pinned `liquid` gem — see the `add-github-actions-deploy` change). Verification here uses the same pattern already established: push to a branch, let the Actions `build` job (which runs in a compatible, GitHub-Pages-matching environment) build the site, download the artifact, and diff it against the current live site's output.

## Risks / Trade-offs

- **[Risk]** `remote_theme` resolution could behave differently under `actions/jekyll-build-pages` than expected (e.g. network access to fetch the theme archive during the containerized build) → **Mitigation**: this is exactly what the branch/PR verification step in tasks.md exists to catch, before touching `master`.
- **[Risk]** A customization gets missed in the audit and quietly regresses (e.g. a class name or attribute string subtly different from what's cataloged here) → **Mitigation**: tasks.md includes a full before/after diff of the built site's HTML/CSS output, not just a visual spot-check, so a missed regression shows up as a concrete diff line rather than relying on eyeballing pages.
- **[Trade-off]** Local Sass partials/includes that are kept as overrides but only *partially* differ from the gem (e.g. `_item.scss`, `variables.yml`) still require carrying the whole file locally — Jekyll's override mechanism is file-granular, not line-granular. Accepted; splitting a single small tweak out further isn't worth the added indirection.
- **[Risk]** If the upstream `kitian616/jekyll-TeXt-theme` repository is ever deleted, renamed, or made private, `remote_theme` would break the build with no local fallback → **Mitigation**: accepted for now given the theme has been stable/unmaintained-but-present for years; noted here so it's a known trade-off, not a silent one.
