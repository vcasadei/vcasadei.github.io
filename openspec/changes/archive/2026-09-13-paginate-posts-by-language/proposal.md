## Why

Classic `jekyll-paginate` (the only pagination plugin whitelisted by the `github-pages` gem) paginates across *all* site posts regardless of language, before any per-page language filter ever runs. `translate-english-posts-to-portuguese` hit this directly: once total post count crossed the `paginate: 8` threshold, the English home page's first page silently dropped 2 English posts to an unlinked, mixed-language "page 2". The stopgap fix was to unpaginate both home pages entirely (`articles.data_source: site.posts`, rendering every post on one page). That works today but doesn't scale — as more posts (in either language) get added, both home pages will keep growing into a single, ever-longer page with no real pagination at all.

This proposal is the definitive fix: real, correctly-scoped pagination for each language's home page independently.

## What Changes

- **BREAKING (build pipeline)**: replace the `build` job's `actions/jekyll-build-pages` step with a custom Ruby build (`ruby/setup-ruby` + `bundle install` + `bundle exec jekyll build`), since `actions/jekyll-build-pages` ships its own fixed `github-pages`-gem environment baked into its Docker image and only ever reads the repo's `Gemfile` to print a compatibility warning — it never actually installs or builds against it. Confirmed via the action's own `entrypoint.sh`.
- Switch the `Gemfile` from `github-pages` to a plain `jekyll` dependency plus `jekyll-paginate-v2`, which supports pagination scoped to an arbitrary post subset (e.g. by category/collection), unlike classic `jekyll-paginate`'s single global sequence.
- Reconfigure pagination so the English home page (`/`, `/page2`, ...) paginates only `lang: en` posts, and the Portuguese home page (`/pt/`, `/pt/page2`, ...) paginates every post using the same scoping/dedup/fallback rules `article-list.html` already applies elsewhere (English posts with no Portuguese translation still appear via `title_pt` fallback; a translated pair shows only its Portuguese member).
- Remove the `index.html`/`pt/index.html` `articles.data_source: site.posts` overrides and the corresponding "unpaginated page" guard in `_includes/paginator.html`, both added as the `translate-english-posts-to-portuguese` stopgap — both home pages get real, correctly-scoped multi-page pagination again.
- Add one small custom Jekyll generator plugin (only possible now that the build no longer runs in the `github-pages` gem's restricted `safe` mode) that computes, at build time, which posts belong in the Portuguese listing — mirroring the dedup/fallback rule `article-list.html` already applies in Liquid — so `jekyll-paginate-v2` can paginate the Portuguese home page by that computed grouping instead of only by a single `locale` field.
- No change to any other page's scoping/dedup/fallback logic (archive, tag search) — this proposal is scoped to the two home pages' actual pagination mechanism.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `site-build-pipeline`: the build step's exact mechanism changes (custom Ruby build instead of the wrapped `actions/jekyll-build-pages` action, needed to actually install and use non-`github-pages`-whitelisted gems), while the existing requirements (auto-deploy on push, PR build validation, pinned/reproducible dependencies) continue to hold — this change is what makes "builds using a pinned, version-locked set of gem dependencies" actually true in practice rather than only nominally true (the current build has never actually installed from the repo's own `Gemfile.lock` at all; discovered during this proposal's research).
- `site-internationalization`: the "Listings are scoped to the current page's language" requirement is extended to explicitly cover *every* paginated page of a home listing, not just its first page.

## Impact

- **Affected files**: `.github/workflows/deploy.yml` (build step), `Gemfile`/`Gemfile.lock` (drop `github-pages`, add `jekyll` + `jekyll-paginate-v2`), `_config.yml` (pagination plugin config), `index.html`/`pt/index.html` (remove the stopgap override), `_includes/paginator.html` (remove the stopgap guard, adapt to the new plugin's pagination object), possibly `_includes/article-list.html` if the new plugin's per-page post list needs different access than classic `paginator.posts`.
- **Affected systems**: the build pipeline moves off GitHub's officially-blessed `actions/jekyll-build-pages` wrapper. This repository takes on responsibility for its own Ruby/Jekyll/plugin version compatibility that GitHub previously managed implicitly via the `github-pages` gem's pinned, tested plugin set. Any future plugin GitHub adds/removes from that whitelist no longer affects this build either way.
- **No impact** to hosting/deployment itself — `actions/deploy-pages` publishes whatever static files the build step produces, regardless of how they were generated.
