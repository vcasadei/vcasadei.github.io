## 1. Locale data foundation

- [ ] 1.1 Add a `pt-BR` block to `_data/locale.yml` (translating SUBSCRIBE, READMORE, SEARCH, CANCEL, VIEWS, LAST_UPDATED, PREVIOUS, NEXT, ARTICLE_DATE_FORMAT, ARTICLE_LIST_DATE_FORMAT, STATISTICS, LICENSE_ANNOUNCE, POST_ON_GITHUB, FOLLOW_ME, FOLLOW_US, EMAIL_ME, EMAIL_US, COPYRIGHT_DATES), following the same key structure as the existing `en`/`fr`/`tr` blocks
- [ ] 1.2 Add `defaults:` scope to `_config.yml`: `path: "_posts/pt"`, `type: posts` → `lang: pt-BR`, `permalink: /pt/:year/:month/:day/:title.html`; verify the file still parses as valid YAML

## 2. Portuguese structural pages

- [ ] 2.1 Create `pt/index.html` (`layout: home`, `lang: pt-BR`, `permalink: /pt/`)
- [ ] 2.2 Create `pt/archive.html` (`layout: archive`, `lang: pt-BR`, `permalink: /pt/archive.html`)
- [ ] 2.3 Create `pt/about.md` (`layout: article` or matching `about.md`'s layout, `lang: pt-BR`, `permalink: /pt/about.html`) with a drafted Portuguese translation of the current English About content (placeholder-aware: `about.md` itself is still "Soon" pending the separate `finish-about-page` change — draft a reasonable Portuguese stub now, to be refined once the English source is finalized)

## 3. Migrate the existing Portuguese post into the formal structure

- [ ] 3.1 Move `_posts/2026-09-11-assistente-pessoal-local-hacktown-2026.md` into `_posts/pt/`, keeping the same filename/date (new URL becomes `/pt/2026/09/11/assistente-pessoal-local-hacktown-2026.html`)
- [ ] 3.2 Remove its now-redundant `hide_from_index: true` (superseded by language-scoped filtering from task 4) and `sitemap: false` (Portuguese content should now appear in the Portuguese sitemap/listings) front matter
- [ ] 3.3 Add `translation_key: local-personal-assistant-hacktown-2026` (or another shared value) to both this post and its English counterpart's front matter
- [ ] 3.4 Update the manual cross-link paragraphs in both posts' bodies (added in the earlier PT-post change) to point at the post's new URL, or replace them with reliance on the new language switcher (task 6) — avoid two competing cross-link mechanisms on the same pages
- [ ] 3.5 Update `_data/variables.yml`'s giscus config usage: no change needed here, but confirm the `custom.html` mapping change (task 7) correctly shares a thread between this pair

## 4. Language-scoped listings (supersedes `hide_from_index`)

- [ ] 4.1 Update `_includes/article-list.html` to filter `include.articles` by `(article.lang | default: 'en') == (page.lang | default: 'en')` instead of the `hide_from_index` check
- [ ] 4.2 Update `_includes/tags.html`'s "Show All" count and `_includes/paginator.html`'s post-count stat the same way
- [ ] 4.3 Update `_includes/search-providers/default/search-data.js` the same way, so the client-side search index is also language-scoped
- [ ] 4.4 Verify (via a test build) that the English archive/home no longer list the Portuguese post, and `/pt/archive.html`/`/pt/` list it correctly

## 5. Post title translation

- [ ] 5.1 Draft `title_pt` front matter for the 5 English-only posts (Hello World!; Scrum for Applied Research; Upgrading Network and Security Cameras on a Rural Property (on a budget); Improving Home Security using AI; SCRUM4Research - Lessons Learned and Tips on Sprint Planning) — flagged for owner review, same treatment as the `finish-about-page` change's drafted content
- [ ] 5.2 Update the Portuguese archive/home listing template logic to render `article.title_pt | default: article.title` when the current page's `lang` is Portuguese, and to link to the article's own URL (which, for untranslated posts, is simply their existing English URL — no separate Portuguese permalink exists for them)

## 6. Language switcher and language-aware nav

- [ ] 6.1 Reintroduce a local `_includes/header.html` override (based on the theme's current version) adding a switcher link: to `page.translation_key`'s counterpart URL when the current post has one, else to `/pt/` (from an English page) or `/` (from a Portuguese page)
- [ ] 6.2 In the same override, make the "Archive"/"About" nav item hrefs language-aware: `/pt/archive.html`/`/pt/about.html` when `page.lang` starts with `pt`, else the existing English URLs
- [ ] 6.3 Verify the switcher and nav links render correctly on: an English post with a translation, an English post without one, the Portuguese post, `/pt/`, `/pt/archive.html`, `/pt/about.html`, and the English equivalents

## 7. Shared comments across paired posts

- [ ] 7.1 Change `_includes/comments-providers/custom.html`'s `data-mapping` from `{{ site.comments.giscus.mapping | default: 'pathname' }}` to `"specific"`, and add `data-term="{{ page.translation_key | default: page.key }}"`
- [ ] 7.2 Update `_config.yml`'s `comments.giscus.mapping` value (or remove it, since it's no longer read) to avoid dead/misleading config
- [ ] 7.3 Verify via a test build that the English and Portuguese HackTown posts both compute the same `data-term`, and an unpaired post (e.g. `hello-world`) computes its own unique term unaffected by this change

## 8. Verify via a real build (branch + PR)

- [ ] 8.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes
- [ ] 8.2 Download the built artifact and check: `/pt/index.html`, `/pt/archive.html`, `/pt/about.html` exist and render in Portuguese; the English archive excludes the Portuguese post and vice versa; the language switcher appears and links correctly on a sample of pages; the giscus embed's `data-term` matches between the paired EN/PT posts
- [ ] 8.3 Confirm no unrelated pages regressed (diff a few untouched pages against the pre-change build, similar to the verification done in `migrate-to-theme-gem`)
- [ ] 8.4 Merge to `master`; confirm the `deploy` job succeeds

## 9. Confirm live and finalize

- [ ] 9.1 Load `/pt/`, `/pt/archive.html`, `/pt/about.html` on the live site and confirm they render correctly
- [ ] 9.2 Confirm the language switcher works live, in both directions, for both a paired and an unpaired page
- [ ] 9.3 Confirm live that the previously separate EN/PT giscus threads are now unified (new comments on either page appear on both) — accept that any prior comments under the old `pathname` mapping are no longer linked (documented breaking change)
- [ ] 9.4 Ask the owner to review the drafted `title_pt` values and the Portuguese About page draft, and edit as needed
- [ ] 9.5 Confirm `openspec validate add-bilingual-pt-support --strict` passes
