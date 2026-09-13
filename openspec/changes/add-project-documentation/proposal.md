## Why

This repository has no `README.md` and no project documentation at all today, despite having accumulated a fair amount of non-obvious, undocumented behavior over this session's changes: a bilingual EN/PT-BR system with post pairing, an automated image-optimization pipeline, per-language pagination via a custom Jekyll plugin, and a build that no longer uses GitHub's classic Pages builder. Anyone (including the owner, months from now) landing on this repo has no map of how it works, what it depends on, or how to safely add a new post.

## What Changes

- Add a `README.md` at the repo root: what the site is, a link to the live site, a GitHub Actions build/deploy status badge, a license badge, and a short "docs" table of contents linking into the new `docs/` folder.
- Add a `docs/` folder (renders directly in GitHub's file browser, no build step needed to read it) with:
  - `docs/architecture.md` — how the site works: Jekyll + remote theme (`jekyll-remote-theme`, pinned to `kitian616/jekyll-TeXt-theme@v2.2.6`), the GitHub Actions build/deploy pipeline (image optimization → `bundle exec jekyll build` → deploy), the bilingual EN/PT-BR system (`lang`/`locale` front matter, `translation_key` pairing, language switcher, shared giscus comments), and per-language pagination (`jekyll-paginate-v2` + the `pt_listing_tag` generator plugin).
  - `docs/dependencies.md` — the Gemfile's gems and why each is there (including the `jekyll-paginate` load-only dependency quirk), the OS-level image-optimization tools (`imagemagick`, `webp`), and the Ruby version pinned in CI.
  - `docs/writing-posts.md` — how to add a new post: file naming/location convention (English in `_posts/`, Portuguese in `_posts/pt/`), the front-matter fields actually in use across existing posts (`layout`, `title`, `title_pt`, `key`, `cover`, `mode`, `header`, `article_header`, `show_excerpt`, `translation_key`), the `<!--more-->` excerpt marker, and how to pair a translation.
  - `docs/post-features.md` — what can be used inside a post body: Markdown/kramdown basics, math via MathJax (`mathjax: true` is already enabled in `_config.yml`), Mermaid diagrams and Chart.js charts (both enabled in `_config.yml`), fenced code blocks with Rouge syntax highlighting (including `linenos`/`mark_lines`), footnotes, tables, a table of contents (`aside.toc`), embedding a YouTube video, and images (cover/thumbnail behavior from the image-optimization pipeline, and using local relative paths rather than absolute GitHub URLs).
- Update `openspec/config.yaml` with a short, per-artifact `rules.tasks` entry so that future OpenSpec changes are prompted, while their own `tasks.md` is being written, to include a task updating the relevant `docs/*.md` file whenever the change touches architecture, dependencies, or the post-authoring workflow/features — keeping this documentation from silently going stale the way the rest of the project's history did before this change.
- No code or behavior changes — this is a pure documentation addition.

## Capabilities

### New Capabilities
- `project-documentation`: the repository SHALL maintain accurate, discoverable documentation of its own architecture, dependencies, and post-authoring workflow.

### Modified Capabilities
(none)

## Impact

- **Affected files**: new `README.md`; new `docs/architecture.md`, `docs/dependencies.md`, `docs/writing-posts.md`, `docs/post-features.md`; `_config.yml` gains `README.md` and `docs/` in its existing `exclude:` list, so Jekyll doesn't copy these front-matter-less files into the deployed `_site` output (they're meant to be read on GitHub, not served as pages on the live site); `openspec/config.yaml` gains a short `rules.tasks` entry.
- **Affected systems**: none beyond that one `exclude:` addition — no template or workflow change, no change to any existing page or post.
- **No impact** to the live site's rendered content, the build pipeline's behavior, or any existing content.
