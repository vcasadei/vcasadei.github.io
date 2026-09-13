## 1. Switch the build step off actions/jekyll-build-pages

- [ ] 1.1 Replace `.github/workflows/deploy.yml`'s `build` job step with `ruby/setup-ruby` (`bundler-cache: true`) followed by `bundle exec jekyll build --destination ./_site`; verify the workflow YAML is valid and the job still uploads the artifact from the same destination the `deploy` job expects
- [ ] 1.2 Update the `Gemfile`: replace `gem "github-pages"` with a pinned `gem "jekyll"` version, add `gem "jekyll-paginate-v2"`, and add explicit `gem` lines for any other plugin the site currently relies on that was previously pulled in transitively by the `github-pages` metagem (check the current `Gemfile.lock` for what's actually in use: `jekyll-remote-theme`, `jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`, etc.)
- [ ] 1.3 Regenerate `Gemfile.lock` against the new `Gemfile`; verify `bundle install` succeeds locally or in CI

## 2. Add locale/pt-listing fields to posts and defaults

- [ ] 2.1 Add `locale: en` to `_config.yml`'s existing `_posts` (root, English) `defaults:` scope, and `locale: pt-BR` to the existing `_posts/pt` `defaults:` scope — same mechanism already used for `lang`, no per-post front-matter changes needed
- [ ] 2.2 Write `_plugins/pt_listing_tag.rb`: a Jekyll generator (registered to run before `jekyll-paginate-v2`'s own generator) that tags every post with a synthetic `pt-listing` category when it belongs in the Portuguese listing — a Portuguese post always qualifies; an English post qualifies only when no Portuguese post shares its `translation_key` — mirroring `_includes/article-list.html`'s existing Liquid dedup rule exactly; verify with a unit-level check (e.g. a small script or `jekyll build` + inspecting generated category data) that the 5 translated English posts do NOT get tagged and any hypothetically untranslated English post would

## 3. Configure jekyll-paginate-v2

- [ ] 3.1 Add the site-wide `pagination:` block to `_config.yml` (`enabled: true`, `per_page: 8`, `permalink` matching today's `/page:num`, `sort_field: date`, `sort_reverse: true`)
- [ ] 3.2 Add `pagination: { locale: en }` to `index.html`'s front matter and remove its `articles.data_source: site.posts` override
- [ ] 3.3 Add `pagination: { category: 'pt-listing' }` to `pt/index.html`'s front matter and remove its `articles.data_source: site.posts` override
- [ ] 3.4 Update `_includes/paginator.html`: remove the `_page_articles_source != 'site.posts'` stopgap guard; simplify the custom `_post_count` loop now that `paginator.posts`/`paginator.total_pages` are already correctly scoped per page (verify `article-list.html`'s existing per-item title/link fallback logic - e.g. `title_pt`, English-URL fallback for an untranslated post appearing on the Portuguese listing via `pt-listing` - still applies correctly to whatever `paginator.posts` now contains)

## 4. Verify via a real build (branch + PR)

- [ ] 4.1 Push to a branch and open a PR; confirm the new custom build step succeeds (not just that a check exists — confirm it's actually running `bundle exec jekyll build`, not the old wrapped action)
- [ ] 4.2 Download the built artifact and check: `/`, `/page2` (and further pages if any) contain only English posts, correctly split across pages; `/pt/`, `/pt/page2` (etc.) contain the correctly deduped Portuguese listing, split across pages; the pagination widget's stats/page-links match reality on both
- [ ] 4.3 Confirm no unrelated pages regressed (diff a sample of untouched pages against a master build)
- [ ] 4.4 Merge to `master`; confirm the `deploy` job succeeds using the new build step

## 5. Confirm live

- [ ] 5.1 Load `/`, `/page2`, `/pt/`, and `/pt/page2` (if generated) live and confirm each shows the correct, language-scoped set of posts
- [ ] 5.2 Confirm `openspec validate paginate-posts-by-language --strict` passes
