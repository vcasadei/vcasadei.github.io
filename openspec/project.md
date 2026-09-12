# Project Overview — vcasadei.com

## What this is

This repository is Vitor Casadei's personal blog, published at **https://www.vcasadei.com** (custom domain via `CNAME`) and hosted on **GitHub Pages**. The blog covers AI, Computer Vision, and Accessibility, with early posts also touching on home networking/security and Scrum for R&D teams (per `_config.yml`'s `description` and the actual post content).

Notably, the repository *is* a fork of the **[jekyll-TeXt-theme](https://github.com/kitian616/jekyll-TeXt-theme)** project rather than a site that merely depends on the theme as a gem. The full theme source (layouts, includes, Sass, docs, tests, build tooling) lives directly in this repo alongside the actual blog content. This means the site's own content (posts, `_config.yml`, `about.md`, images) is intermixed with a complete copy of the upstream theme's codebase and its documentation/demo site (`docs/`) and test fixtures (`test/`).

## Tech stack

- **Static site generator:** Jekyll (via the `github-pages` gem, so it builds using whatever Jekyll/plugin versions GitHub Pages' hosted build supports)
- **Theme:** jekyll-text-theme (vendored in-repo, not consumed as an external gem despite the `Gemfile` also listing it — the local `_layouts`/`_includes`/`_sass` take precedence)
- **Templating:** Liquid
- **Markdown:** kramdown, syntax highlighting via Rouge
- **Styling:** Sass/SCSS (`_sass/`), compiled to `assets/css/main.scss` → `main.css`
- **Client-side:** vanilla JS/jQuery (theme scripts under `_includes/scripts`), plus a standalone vanilla-JS game (see "Space Invaders 404 page" below)
- **Plugins:** `jekyll-feed`, `jekyll-paginate`, `jekyll-sitemap`, `jemoji`
- **Package tooling:** `package.json` provides npm scripts that wrap Jekyll/Docker commands (build, serve, docker dev/prod variants, lint); these are theme-authoring conveniences, largely orthogonal to publishing the blog itself
- **Linting:** ESLint (`.eslintrc`) for theme JS, Stylelint (`.stylelintrc`) for Sass, commitlint (`.commitlintrc.js`) + Husky for conventional commit messages

## Deployment

- Publishing runs through a GitHub Actions workflow (`.github/workflows/deploy.yml`): every push to `master` builds the Jekyll site (via `actions/jekyll-build-pages`) and deploys the result to GitHub Pages (via `actions/deploy-pages`); pull requests get the same build step as a check, without deploying. `Gemfile.lock` is committed so this build resolves the same gem versions every run. The repo's Settings → Pages source is set to "GitHub Actions" (cut over from the old "Deploy from a branch" mode), so this workflow is the sole publish path.
- `CNAME` points the custom domain `vcasadei.com` at GitHub Pages.
- The legacy `.travis.yml` (which built the *theme's demo/docs site*, `docs/_config.yml`, and deployed it to a `gh-pages` branch — never how this blog was actually published) has been removed.
- `Dockerfile.dev` and `docker/docker-compose.*.yml` provide containerized dev/build/serve environments (Ruby 2.7 + Jekyll + optional Nginx). These are optional local-preview tooling only — publishing no longer depends on a local Docker build.

## Content model

- Posts live in `_posts/` as Markdown files with YAML front matter (`layout: article`, `title`, `key`, `cover`, `permalink` in some, `article_header` with themed gradient overlays, `mode: immersive`, etc.). Defaults for all posts are set centrally in `_config.yml` (`layout: article`, `sharing: true`, `license: true`, TOC in the aside, etc.).
- Current posts (5):
  - *Hello World!* — introductory post
  - *Scrum for Applied Research*
  - *Upgrading Network and Security Cameras on a Rural Property (on a budget)*
  - *Improving Home Security using AI* (filename has a stray " copy" suffix: `2024-09-20-improving-home-security-using-ai copy.md`)
  - *SCRUM4Research - Lessons Learned and Tips on Sprint Planning*
- `about.md` is a placeholder — its body is currently just "Soon".
- Cover/hero images live under `assets/images/`.
- Standard theme pages: `archive.html` (all-posts archive), `404.html`, `index.html` (home/article-list layout).

## Core features (inherited from the TeXt theme, active via `_config.yml`)

- **Skin/theme:** `dark` skin, `tomorrow-night` code highlight theme
- **Math/diagrams/charts:** MathJax (with auto-numbering) and Mermaid enabled; Chart.js enabled
- **Table of contents:** per-article aside TOC
- **Pagination:** 8 posts per page (`jekyll-paginate`)
- **Sharing:** AddToAny share buttons on articles
- **Comments:** Gitalk, backed by a GitHub OAuth App and a `comments` repo (`vcasadei/comments`) used as the issue-tracker/comment store; `vcasadei` is the sole configured admin
- **Search:** theme's built-in client-side search (`search.provider: default`, via `assets/search.js`)
- **Analytics:** Google Analytics (GA4 `tracking_id: G-675GNP80XM`)
- **RSS:** `jekyll-feed` → `/feed.xml`
- **Sitemap:** `jekyll-sitemap`
- **Emoji:** `jemoji`
- **License footer:** CC-BY-NC-4.0 shown on articles
- **i18n scaffolding:** `_data/navigation.yml` and layouts carry multi-language label config (English is the only language actually used; `lang: en`)

## Design / visual identity

The site currently uses the **stock TeXt theme look**, unmodified: `_sass/custom.scss` (the theme's designated customization hook) is empty, and there's no evidence of bespoke skin work in git history. Visual identity is effectively "TeXt theme, dark skin, tomorrow-night highlighting" — round buttons/cards, large prominent post titles, immersive full-bleed header images per post with a per-post duotone gradient overlay (`background_color` + `gradient` in front matter), consistent across the 4 non-intro posts (`rgba(7, 44, 24, .69)` → `rgba(38, 3, 38, .64)`).

## Notable custom addition: Space Invaders 404 page

`_layouts/404.html` embeds a self-contained vanilla-JS Space Invaders clone (`assets/space-invaders/`: `game.js`, `ai.js`, `controls.js`, `draw.js`, `objects.js`, `update.js`, `utils.js`, `assets.js`, plus sprite images and `enemies.json`) inside an `<iframe>`, with a "Reload Game" button that reloads the iframe. This is the most recent and most actively developed piece of custom work in the repo (`404 page`, `improving game` commits) and is the one clearly hand-built feature distinguishing this site from a default theme install.

## Things worth knowing / current-state notes

- Comments now run on **giscus** (GitHub Discussions-backed, via the theme's `comments.provider: custom` hook). The previous Gitalk setup committed a live OAuth App client secret in plaintext in `_config.yml`; that secret has been removed from config and the backing GitHub OAuth App revoked (see the `security-hygiene-cleanup` change). `_includes/comments-providers/gitalk.html` still exists as inert, unused theme scaffolding (same as the unused `disqus.html`/`valine.html` provider templates) — harmless since nothing includes it while `provider: custom` is active.
- **`docs/`, `test/`, `screenshots/`, `tools/`, `README.md`/`README-zh.md`, `CHANGELOG.md`, `HOW_TO_RELEASE.md`, `jekyll-text-theme.gemspec`** are all upstream theme project artifacts (demo site, theme test fixtures, theme release tooling/docs) rather than content about vcasadei.com. `_config.yml`'s `exclude:` list keeps most of these out of the built site, but they still add significant repo weight/noise when navigating or reasoning about "the blog" vs. "the theme".
- **`about.md`** has no real content yet ("Soon").
- `openspec/` in this repo is the OpenSpec spec-driven workflow scaffold (this file included) — unrelated to the blog's runtime.
