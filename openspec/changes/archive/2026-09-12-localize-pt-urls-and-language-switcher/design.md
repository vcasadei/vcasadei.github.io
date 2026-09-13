## Context

`pt/about.md` and `pt/archive.html` (added in `add-bilingual-pt-support`) currently reuse the English URL slugs under `/pt/`. The header's nav-href localization (`_includes/header.html`) currently derives a Portuguese nav URL by naively prepending `/pt` to the English path (`'/pt' | append: _item_url`) — that only works because today the slug is identical in both languages. Once the slugs diverge (`archive.html` → `arquivo.html`, `about.html` → `sobre.html`), that string-prepend no longer produces a valid URL.

The language switcher itself (also in `header.html`) is a plain `<a>` tag; there's no existing dropdown, flag icon, or confirm-before-navigate pattern anywhere in the theme or this repo to reuse. There is also no local CSS/JS build pipeline (per `migrate-to-theme-gem`, the theme is consumed purely via `remote_theme`, nothing vendored) — any new styling or behavior has to be self-contained in the `_includes` files that need it, typically as an inline `<style>`/`<script>` block, matching how the theme itself does small per-include styling.

## Goals / Non-Goals

**Goals:**
- Give the two Portuguese structural pages proper Portuguese URLs, with all internal links (nav, switcher fallback) updated to match.
- Replace the plain-text switcher with a flag-labeled dropdown that confirms before navigating.

**Non-Goals:**
- No redirect layer for the old `/pt/about.html` / `/pt/archive.html` URLs (owner decision — see proposal).
- No new build pipeline (SCSS/JS bundler, npm dependency) — styling/behavior stays inline in the relevant `_includes` file(s).
- No change to *which* page/post the switcher targets — only presentation (dropdown + flags) and the added confirmation step.
- No browser-language auto-detection banner (explicitly decided against in favor of a simple confirm-on-click).

## Decisions

**Portuguese slugs**: `sobre` (about) and `arquivo` (archive) — matching the Portuguese nav labels already added to `_data/navigation.yml` ("Sobre", "Arquivo") in `add-bilingual-pt-support`, so the URL and the visible label agree.

**Nav href localization**: replace `header.html`'s `'/pt' | append: _item_url` string-prepend with an explicit small mapping (a Liquid `case`/`if` over the two known English nav paths → their Portuguese equivalents), since there are only two nav items today and a full slug-translation data file would be over-engineering for that. If a third localized nav item is ever added, this mapping grows by one branch.

**Flag icons**: render as Unicode flag emoji (🇧🇷, 🇺🇸) rather than image/SVG assets — zero new asset pipeline, and the repo already used these exact emoji in post body text before `add-bilingual-pt-support` removed them (manual cross-link paragraphs). Consistent, no extra request/asset weight.

**Dropdown implementation**: a `<button>` (matching the existing `search-button` toggle idiom already in `header.html`) that reveals a small `<ul>` of language options, rather than a native `<select>`. A native `<select>`'s `change` event fires with the new value already committed, so cancelling a `confirm()` inside the handler requires manually resetting the select's value back — fiddlier and more error-prone than a button+list where each option is its own link/button that simply doesn't navigate on cancel. Toggle state (open/closed) and outside-click-to-close are handled by a small inline `<script>` in `header.html`, scoped to a single dropdown instance (the header renders once per page).

**Confirmation mechanism**: the browser's native `confirm()` dialog. No new dependency, keyboard/screen-reader accessible by default (unlike a custom modal, which would need its own focus-trap and ARIA work for comparable accessibility) — appropriate for a single yes/no gate before navigation.

## Risks / Trade-offs

- [Old `/pt/about.html` / `/pt/archive.html` links break with no redirect] → Accepted per owner decision; both pages have been live only briefly, so external inbound links are expected to be negligible.
- [`confirm()` is a blocking, browser-styled dialog — not visually customizable] → Acceptable trade-off for the accessibility/simplicity win; revisit only if it becomes a real UX complaint.
- [Hardcoding the nav-path mapping in `header.html` doesn't scale past a handful of nav items] → Acceptable now (exactly two items); flagged in the Decisions section above as the point to revisit if nav grows.

## Migration Plan

1. `git mv pt/about.md pt/sobre.md`, `git mv pt/archive.html pt/arquivo.html`; update each file's `permalink:` front matter to the new path (`/pt/sobre.html`, `/pt/arquivo.html`); no other front matter changes.
2. Update `_includes/header.html`'s nav-href localization to the explicit path mapping described above.
3. Update `_includes/header.html`'s switcher fallback URLs if they reference the old slugs directly (they currently only reference `/pt/` and `/`, which are unaffected — verify during implementation).
4. Implement the dropdown + flags + confirm-on-click switcher in the same file.
5. Verify via a real build (branch + PR, per this repo's established practice since local Jekyll builds are broken) that: the new PT URLs render, the old ones 404, nav links on PT pages resolve correctly, and the switcher's confirm/cancel behavior works as designed.
