## 1. Write the architecture and dependencies docs

- [x] 1.1 Write `docs/architecture.md`: the remote-theme setup (`jekyll-remote-theme`, `kitian616/jekyll-TeXt-theme@v2.2.6`), the GitHub Actions build/deploy pipeline (image optimization → `bundle exec jekyll build` → deploy), the bilingual EN/PT-BR system (`lang`/`locale`, `translation_key` pairing, language switcher, shared giscus comments), and per-language pagination (`jekyll-paginate-v2` + `_plugins/pt_listing_tag.rb`); verify each described mechanism against the actual current source (`_config.yml`, `.github/workflows/deploy.yml`, `_includes/header.html`, `_plugins/pt_listing_tag.rb`) rather than from memory — done; verified against the actual current `Gemfile`, `deploy.yml`, `_config.yml`, and `_plugins/pt_listing_tag.rb` contents
- [x] 1.2 Write `docs/dependencies.md`: every gem in `Gemfile` and why it's there (including the `jekyll-paginate` load-only quirk), the OS-level image tools (`imagemagick`, `webp`) the build step installs, and the Ruby version pinned in CI; verify against the actual `Gemfile` and `deploy.yml` contents — done

## 2. Write the post-authoring docs

- [x] 2.1 Write `docs/writing-posts.md`: file naming/location convention (`_posts/YYYY-MM-DD-slug.md` for English, `_posts/pt/` for Portuguese), the front-matter fields in current use (`layout`, `title`, `title_pt`, `key`, `cover`, `mode`, `header`, `article_header`, `show_excerpt`), the `<!--more-->` excerpt marker, and how to pair a translation via `translation_key`; verify field names against actual existing posts, not assumed conventions — done; verified field names against `_config.yml`'s `defaults:` scope and existing post front matter
- [x] 2.2 Write `docs/post-features.md`: Markdown/kramdown basics, MathJax (inline/block math), Mermaid diagrams, Chart.js charts, Rouge-highlighted code blocks (including `linenos`/`mark_lines`), footnotes, tables, the table of contents (`aside.toc`), embedding a YouTube video, and images (cover/thumbnail pipeline behavior; use local relative paths, not absolute GitHub URLs) — each with a minimal working example; verify each feature is actually enabled by checking `_config.yml` and an existing post that uses it — done; fetched the theme's own sample docs posts (`docs/_posts/2017-05-05-chart.md`, `2017-06-06-mermaid.md`, `2017-07-07-mathjax.md` at the pinned `v2.2.6` tag) to confirm exact syntax rather than guessing, and confirmed `mathjax`/`mermaid`/`chart`/`aside.toc` are all already enabled site-wide in this repo's own `_config.yml`; confirmed the youtube embed syntax against the actual existing post that uses it

## 3. Add the README and exclude the docs from the built site

- [x] 3.1 Write `README.md`: project description, live-site link, GitHub Actions build/deploy status badge, MIT license badge, and a table of contents linking into `docs/` — done
- [x] 3.2 Add `README.md` and `docs/` to `_config.yml`'s existing `exclude:` list — done; verified the resulting YAML still parses

## 4. Keep docs in sync for future changes

- [x] 4.1 Add a short `rules.tasks` entry to `openspec/config.yaml` prompting future changes' task lists to include a docs-update task when the change touches architecture, dependencies, or the post-authoring workflow/features; keep it to one or two lines (per the owner's "small and objective, not thousands of lines" instruction) rather than a per-doc-file checklist — done, one bullet
- [x] 4.2 Verify by running `openspec instructions tasks --change "<any other active or dummy change>" --json` (or re-reading `openspec/config.yaml`) that the new rule is present and would surface in a future `tasks` artifact generation — confirmed: `openspec instructions tasks --change "add-project-documentation" --json` returns the new rule verbatim in its `rules` field

## 5. Verify via a real build (branch + PR)

- [ ] 5.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes
- [ ] 5.2 Download the built artifact and confirm `README.md`/`docs/` are absent from `_site` (excluded as intended)
- [ ] 5.3 On the PR/branch in GitHub's own file browser, confirm `README.md` renders with a working live-site link and confirm the build-status badge image loads (a badge for an in-progress/queued run is expected to still render, just showing a different status)
- [ ] 5.4 Confirm no unrelated pages regressed (diff a sample of untouched pages against a master build)
- [ ] 5.5 Merge to `master`; confirm the `deploy` job succeeds

## 6. Confirm live

- [ ] 6.1 Load the repository's GitHub page and confirm the README renders with an accurate, current build-status badge
- [ ] 6.2 Confirm none of `README.md`/`docs/*.md` are reachable on the live site (e.g. `https://vcasadei.com/README.md` 404s)
- [ ] 6.3 Confirm `openspec validate add-project-documentation --strict` passes
