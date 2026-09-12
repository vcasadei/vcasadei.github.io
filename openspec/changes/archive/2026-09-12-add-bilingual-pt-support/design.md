## Context

See `proposal.md` - Why. Relevant current state, established by direct investigation:

- The theme (`jekyll-text-theme`, consumed via `remote_theme` since `migrate-to-theme-gem`) already resolves UI strings per-page: `_includes/snippets/get-lang.html` prefers `page.lang` over `site.lang`, and `get-locale-string.html`/`get-string-from-locale-config.html` fall back to the `en` locale block when a key is missing for the resolved language. This already-existing mechanism does everything a plugin like `jekyll-polyglot` would otherwise be needed for, at the level of "translate this page's UI chrome."
- `_data/locale.yml` (a kept local override since `migrate-to-theme-gem`) has locale blocks for `en`, `zh-*`, `ko`, `fr`, `tr` — no `pt`/`pt-BR` block exists yet.
- `_data/navigation.yml`'s schema is `{titles: {<lang>: <label>, ...}, url: <single-url>}` — the label is per-language, but the destination `url` is not. `_includes/header.html` (deleted as an unmodified duplicate during `migrate-to-theme-gem`, so currently sourced from the theme) renders nav items directly from this single `url`, with no language-aware branching.
- `_config.yml` supports `defaults:` scoping by source `path:` (already used for the site's own `type: posts` scope) — a core Jekyll feature, not a plugin, so scoping `_posts/pt/` to apply `lang: pt-BR` and a `/pt/...` permalink automatically requires no new dependency.
- The existing Portuguese post (`_posts/2026-09-11-assistente-pessoal-local-hacktown-2026.md`) predates this design: it's paired with its English twin only via prose cross-links in the body text and hidden from listings via a bespoke `hide_from_index: true` flag (added in the `add-github-actions-deploy`/PT-post follow-up work), not any formal pairing mechanism.
- giscus (added in `security-hygiene-cleanup`) is configured sitewide with `mapping: pathname` in `_config.yml`, consumed by `_includes/comments-providers/custom.html`. Since English and Portuguese URLs differ, `pathname` mapping means paired posts currently get two separate discussion threads.
- `github-pages`'s plugin whitelist (confirmed during `migrate-to-theme-gem`) does not include `jekyll-polyglot`, `jekyll-multiple-languages-plugin`, or similar — ruling out a plugin-based approach entirely for this Actions-built, GitHub-Pages-compatible site.

## Goals / Non-Goals

**Goals:**
- A real `/pt/` section: home, archive, about, all in Portuguese, using existing layouts.
- Every existing and future English post gets a translated title, shown in Portuguese listings, whether or not a full translation exists.
- A formal, front-matter-driven pairing mechanism between an English post and its Portuguese translation, replacing ad hoc prose cross-links.
- A visible language switcher on every page.
- Comments shared between a post's English and Portuguese versions.
- Zero new runtime dependencies (no plugin, no new gem, no new external service).

**Non-Goals:**
- Translating existing post *bodies* — titles only, per the proposal's explicit scope.
- A localized 404 page under `/pt/404.html` — GitHub Pages only serves one root `404.html` for any unmatched path; not achievable without infrastructure beyond this site's current hosting model. Accepted limitation.
- A second registered domain (`vcasadei.com.br`) — clarified out of scope during proposal.
- Migrating `_data/navigation.yml`'s schema to a general-purpose per-language-URL data structure — with only two nav items and two languages, a direct conditional in the header override is simpler than a new generalized schema (see Decisions).
- Automated machine translation of anything — all Portuguese text (titles, About page, locale strings) is either already human-written (the existing HackTown PT post) or drafted here for the owner to review and edit, matching how `finish-about-page` treated `about.md`.

## Decisions

**Language selection via existing per-page `lang:` front matter, not a plugin.**
Confirmed unavailable in the GitHub Pages plugin whitelist; the theme already implements everything a plugin would provide for UI-string translation. Using it means zero new dependencies and a mechanism already proven to work (the theme's own docs describe this as its intended i18n approach).

**Portuguese posts live in `_posts/pt/`, scoped via `defaults:` rather than per-post front matter.**
A `defaults:` block scoped to `path: "_posts/pt"` applying `lang: pt-BR` and `permalink: /pt/:year/:month/:day/:title.html` means a future Portuguese post just needs to be dropped in the right folder — no per-file boilerplate to remember. Alternative considered: keep all posts in one `_posts/` folder and set `lang`/`permalink` by hand on each Portuguese one — rejected as more error-prone (nothing stops a future post from forgetting the `permalink:` override and silently colliding with the English URL scheme).

**Migrate the existing ad hoc Portuguese post into `_posts/pt/`, changing its URL.**
Its current URL (`/2026/09/11/assistente-...`) predates any formal system; leaving it outside `_posts/pt/` would mean the very first real usage of this feature immediately needs a special case. The post is a few days old with presumably minimal external backlinks, so the URL change is low-impact — called out explicitly as a breaking change in the proposal, not silently absorbed.

**`title_pt` (a plain string) rather than restructuring posts into a translation-object front matter.**
Keeps existing post front matter almost untouched (one new optional key) and keeps the Portuguese-listing template logic simple (`page.title_pt | default: page.title`, though untranslated posts should still get a real `title_pt` per the proposal's scope - draft one for all 5 existing English posts as a task, not leave them relying on the fallback).

**`translation_key` as a separate field from the existing `key:`.**
`key:` already exists on every post for other purposes (search index and general tracking) and the two existing HackTown posts already have different, meaningful `key` values. Introducing a new field for pairing avoids repurposing `key` in a way that could conflict with whatever already depends on its uniqueness, and makes the pairing relationship explicit and self-documenting in front matter (`translation_key: local-personal-assistant-hacktown-2026`, matching value on both the EN and PT post) rather than overloading an existing field with a second meaning.

**Generalize `hide_from_index` into language-scoped filtering, in the same four files it already touches.**
`_includes/article-list.html`, `tags.html`, `paginator.html`, `search-data.js` currently filter on a boolean (`post.hide_from_index`). Replacing that condition with a language-match check (`(post.lang | default: 'en') == (page.lang | default: 'en')`) is a strict generalization: an English listing page (`page.lang` unset, defaults to `en`) naturally continues to exclude the Portuguese post exactly as `hide_from_index` did, without a separate flag to maintain going forward. The `hide_from_index` field itself can be removed from the one post that currently sets it, once the language check supersedes it.

**Giscus mapping switches from `pathname` to `specific` with a computed `data-term`.**
`data-term="{{ page.translation_key | default: page.key }}"` gives every unpaired post a stable, unique term (its own `key`, functionally equivalent to today's `pathname` mapping in terms of uniqueness) while giving paired posts a shared term. Alternative considered: keep `pathname` mapping and instead make the *Portuguese* post's URL resolve to the *English* post's discussion via some redirect or giscus-side alias — rejected; giscus has no such aliasing feature, and changing the mapping strategy is simpler and more robust than working around the absence of one.
**Accepted breaking change**: existing `pathname`-mapped discussion threads (giscus went live only a few days ago) are orphaned by this switch. Not migrated; treated as acceptable given how new and low-traffic the feature is.

**Language switcher and language-aware nav links both live in one local `_includes/header.html` override**, not a data-schema change to `navigation.yml`.
With exactly two nav items (Archive, About) and two languages, hardcoding the two Portuguese destinations (`/pt/archive.html`, `/pt/about.html`) directly in a conditional inside the header override is simpler than generalizing `navigation.yml`'s schema to carry a URL per language — especially since this is the same file that needs modifying anyway to add the switcher itself. If a third nav item or third language is ever added, this becomes worth revisiting; not needed today.

## Risks / Trade-offs

- **[Risk]** Reintroducing a local `_includes/header.html` override reverses part of `migrate-to-theme-gem`'s cleanup (that file was deleted as an unmodified duplicate) → **Mitigation**: this is expected, ordinary evolution of the "only genuinely customized files are kept locally" model established by that change, not a regression of it — the file becomes customized because the site now needs custom nav behavior, which it didn't before.
- **[Risk]** The giscus mapping change orphans current discussion threads → **Mitigation**: explicitly accepted in the proposal, not silently absorbed; the feature is new enough that this is low-cost.
- **[Risk]** Moving the existing Portuguese post's URL breaks any link already shared to it (e.g. on social media) → **Mitigation**: accepted given how recent the post is; a redirect could be added later if this proves to matter, but isn't in scope now.
- **[Trade-off]** No localized 404 page under `/pt/` → accepted GitHub Pages platform limitation, not something this design works around.
- **[Trade-off]** `title_pt` values for the 5 existing English-only posts are drafted by this change's implementation, not pre-approved copy → the same review step already established for `about.md` applies here: draft now, owner edits before/soon after shipping.

## Open Questions

- Should the Portuguese About page ship with a placeholder/stub translation now (since the English About page itself is still just "Soon", pending the separate `finish-about-page` change), or should this change's About-page task wait until `finish-about-page` lands? Recorded as a sequencing note in `proposal.md`'s Impact section; either order works without changing this design, so it doesn't block finalizing this plan — can be decided at implementation time.
