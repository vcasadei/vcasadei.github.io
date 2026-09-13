## Context

GitHub Pages serves exactly one static `/404.html` for the entire site, for any URL that doesn't match a real file — it does not support per-directory custom error pages, and Jekyll has no visibility into the actual requested path at build time (there's only ever one 404 page produced). This means the page's language cannot be chosen server-side/at build time the way every other bilingual page on this site does it (via a `lang` front-matter value read from `page.lang`). See proposal.md for the user-facing motivation.

The site's existing bilingual machinery (`_includes/header.html`, `_data/locale.yml`, `_data/navigation.yml`) all key off `page.lang`, which is fixed at build time. None of that machinery can drive this case.

## Goals / Non-Goals

**Goals:**
- Detect, after the 404 page loads, whether the visitor was on a `/pt/` URL, and adjust the visible heading and primary nav accordingly.
- Reuse the same PT nav-URL mapping logic already encoded in `header.html` (`/archive.html` → `/pt/arquivo.html`, `/about.html` → `/pt/sobre.html`), rather than inventing a second copy of it that could drift.

**Non-Goals:**
- Translating the embedded game (explicitly out of scope per the proposal).
- Translating deeper header widgets (search placeholder, language-suggestion banner, language-switcher dropdown contents) — left in English per user decision.
- Any server-side/build-time mechanism — not possible given the GitHub Pages constraint above.

## Decisions

**Detection point and method:** A small inline `<script>` in `_layouts/404.html` (alongside the existing "Reload Game" script already there) checks `window.location.pathname.indexOf('/pt/') === 0` on load, before or after paint (a brief flash of English text is acceptable here, unlike the language-redirect case, since there's no navigation involved).

**Scope of the swap — targeted text/attribute swap, not full duplicate render.** Considered and rejected: rendering the entire header/page twice (once per language) and toggling visibility via CSS/JS. That would duplicate DOM ids the header already uses for the search modal, language-switcher toggle, and suggestion banner, risking id collisions and double-firing of the scripts already wired to `.js-lang-toggle` etc. A targeted swap of specific known elements (heading text, reload button label, the two nav `<a>` elements) avoids this entirely and matches the fidelity level the user asked for.

**Source of translated strings:** the 404 heading and "Reload Game" label are added to `_data/locale.yml` under the `en` and `pt-BR` blocks (new keys, e.g. `PAGE_NOT_FOUND` / `RELOAD_GAME`), and the layout embeds both language variants into the page via Liquid at build time (e.g. as `data-*` attributes or a small inline JS object), so the *client-side* script only ever picks between two build-time-supplied strings — it does not hardcode Portuguese text separately from the rest of the site's i18n system. This keeps the 404 page's translated strings colocated with every other translated UI string, so a future wording change only happens in one place.

**Nav link identification:** the script matches the nav `<a>` elements by their current (English) `href` values (`/archive.html`, `/about.html`) rather than by adding new classes/ids to `header.html`, since those hrefs are already stable, unique identifiers within the 404 page's nav and this avoids touching the shared header component (which renders on every page of the site) for a change that only matters on the 404 page.

## Risks / Trade-offs

- **Hardcoded href matching** (`/archive.html`, `/about.html`) → if the site's English nav URLs ever change, this script silently stops matching and falls back to showing English nav on `/pt/` 404s (a silent no-op, not a crash). Mitigation: this mirrors the same fragility already accepted in `header.html`'s own hardcoded PT-URL mapping (see `_includes/header.html`'s `_item_url == '/archive.html'` check) — this change doesn't introduce a new failure mode, just a second instance of an existing one.
- **Brief flash of English text before the script runs** → acceptable; this is a 404 page, not a page a visitor lingers on or where flash-of-wrong-language would look broken (unlike the full-page language auto-redirect, which runs earlier in `<head>` specifically to avoid this).
