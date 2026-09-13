# Architecture

How this site is built, and how its bilingual and pagination systems work.

## The stack

- **[Jekyll](https://jekyllrb.com/)** (`~> 4.3`) generates the static site from Markdown posts/pages in this repo.
- **Theme**: [`kitian616/jekyll-TeXt-theme`](https://github.com/kitian616/jekyll-TeXt-theme), pinned to `v2.2.6` via `remote_theme:` in `_config.yml` and the `jekyll-remote-theme` plugin. The theme itself isn't vendored into this repo — Jekyll fetches it at build time. Any file this repo places at the same path as a theme file (e.g. `_includes/header.html`, `_includes/article-list.html`) overrides the theme's own version.
- **Hosting**: GitHub Pages, serving the custom domain `vcasadei.com`.

## Build and deploy

`.github/workflows/deploy.yml` runs on every push to `master` and on every pull request:

1. **Optimize images** — recompresses every raster image under `assets/images/` (capped at 1600px, quality 82) and generates a `.webp` sibling for each, plus a small `-thumb` variant (480px, both formats) for the images used as post covers. This only ever touches the CI runner's own checkout, never the committed source — the recompressed files are what gets deployed, but the original, uncompressed images stay untouched in git history.
2. **Build with Jekyll** — `bundle exec jekyll build`, using Ruby 3.3 and the gems pinned in `Gemfile.lock` (see [dependencies.md](dependencies.md)). This is a plain, self-managed build — the workflow does **not** use GitHub's `actions/jekyll-build-pages` action, because that action bundles its own fixed `github-pages` gem environment and only reads this repo's `Gemfile` to print a compatibility warning; it never actually installs from it. Building it ourselves is what makes custom gems like `jekyll-paginate-v2` and a custom `_plugins/` generator (below) possible at all.
3. **Deploy** — the built `_site` output is uploaded and published via `actions/deploy-pages`, only on a push to `master`.

The `pull_request` trigger runs steps 1–2 only, so a broken build shows up on the PR before it can reach `master`.

## Bilingual (EN / Portuguese) support

- Every page/post has an effective language: `lang: en` (the default) or `lang: pt-BR`. Portuguese posts live under `_posts/pt/`; `_config.yml`'s `defaults:` scope auto-applies `lang: pt-BR` and a `/pt/...` permalink to anything in that folder, so individual posts don't need to set it themselves.
- An English post and its Portuguese translation are paired by giving both the same `translation_key` front-matter value. This pairing drives three things:
  - **Listings** (`_includes/article-list.html`): an English listing (home, archive) shows only `lang: en` posts. A Portuguese listing shows every post — using `title_pt` as the link text for a post with no translation yet, linking to the post's own (English) URL — except it hides an English post whose `translation_key` already has a Portuguese sibling in the same listing, so a translated pair doesn't appear twice.
  - **The language switcher** (`_includes/header.html`): looks up the current page's `translation_key` counterpart across `site.posts`; if found, it's a direct link to that page. Otherwise it falls back to the other language's home section (`/` or `/pt/`). It renders as a flag-labeled dropdown and confirms before navigating. This target-resolution logic lives in a shared snippet, `_includes/snippets/language-switch-context.html`, so the header switcher and the auto-redirect script below always compute the same destination.
  - **Comments** (`_includes/comments-providers/custom.html`): giscus is configured with `data-mapping="specific"` and `data-term="{{ page.translation_key | default: page.key | default: page.url }}"`, so a paired EN/PT post shares one comment thread, while an unpaired post gets its own. Comments render on blog posts only — the Home page, Archive page, About page, and 404 page each opt out via `comment: false` in front matter, overriding the theme's page-level default of `comment: true`.

### Automatic language detection and preference persistence

The site suggests and remembers a visitor's preferred language entirely client-side (no server, per GitHub Pages constraints):

- **Suggestion banner** (`_includes/header.html`): on a first-time visitor (no saved preference), a small dismissible bottom banner compares the browser's top-reported language (`navigator.languages[0] || navigator.language`) against the current page's language. If they disagree and the browser language is recognizably English or Portuguese, it suggests the other language — written in the language being suggested — linking to the same target the manual switcher would use.
- **Saved preference**: a single `localStorage` key, `langPref`, holds either a real language code (`en`/`pt-BR`) or `"none"`. It's written by three actions, all treated as equally authoritative: accepting the suggestion banner, dismissing it (saves `"none"`, meaning "asked, declined"), and confirming a manual switch via the header dropdown. Once set, the banner never shows again.
- **Auto-redirect** (`_includes/head/custom.html`): an inline script in `<head>` — running before body paint, to minimize a wrong-language flash — checks `langPref` on every page load; if it names a language different from the current page's, it redirects (`window.location.replace`) to that language's paired counterpart or home-section fallback, the same computation the switcher uses. A `?nolangredirect` query parameter suppresses this, so a deliberately shared link can be viewed as-is. Both this script and the banner wrap their `localStorage` access in try/catch and silently no-op when storage is unavailable (e.g. private browsing).

## Per-language pagination

Classic `jekyll-paginate` (the plugin GitHub's old build path was restricted to) paginates every post as one global, language-blind sequence — mixing English and Portuguese posts into the same numbered pages. Now that the build is self-managed, the site uses **`jekyll-paginate-v2`** instead, which supports scoping a page's pagination to a `locale` or `category`:

- `index.html` (English home) sets `pagination: { locale: en }`.
- `pt/index.html` (Portuguese home) sets `pagination: { category: 'pt-listing' }`.

`pt-listing` isn't a real Jekyll category anyone assigns by hand — it's computed at build time by `_plugins/pt_listing_tag.rb`, a small custom generator that runs before `jekyll-paginate-v2`'s own generator. It mirrors the exact same dedup rule `article-list.html` applies in Liquid: every Portuguese post gets tagged, and an English post gets tagged only if no Portuguese post shares its `translation_key`. Keep the two in sync if either one's logic changes — they're written in different languages (Ruby vs. Liquid) but must agree.

Custom Jekyll plugins like this one only work because the build no longer runs through GitHub's restricted, plugin-whitelist-enforced build path (see above).
