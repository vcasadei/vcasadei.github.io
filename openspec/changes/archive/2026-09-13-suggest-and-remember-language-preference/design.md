## Context

This is a fully static site (GitHub Pages, no server-side logic), so both detection and persistence must be client-side. See `proposal.md` for motivation. The relevant existing code is `_includes/header.html`, which already computes a "switch target" (paired-counterpart URL via `translation_key`, falling back to `/pt/` or `/`) for the manual flag-dropdown switcher, and `_includes/head/custom.html`, the site's local override of the theme's (otherwise empty) `<head>` extension point.

## Goals / Non-Goals

**Goals:**
- One single source of truth for "visitor's saved language preference," updated consistently by both the new banner and the existing manual switcher.
- Minimize any visible flash of wrong-language content for a returning visitor who gets auto-redirected.
- Reuse the existing switch-target resolution logic rather than duplicating it.

**Non-Goals:**
- No support for languages beyond English/Portuguese.
- No server-side or geo-IP detection - browser-reported language only.
- No cross-device sync of the preference (per-browser `localStorage` only).
- No "remind me later"/snooze state - only accept, dismiss, or (implicitly) a manual switch.

## Decisions

### `localStorage` key and value scheme
Single key, e.g. `langPref`, with possible values:
- absent - never asked, no manual switch yet -> banner may show
- `"none"` - visitor dismissed the banner -> never show banner again, never auto-redirect
- `"en"` / `"pt-BR"` - accepted banner or used manual switcher -> auto-redirect to this language when it differs from the current page, never show banner again

A single key keeps "have we asked" and "what did they choose" from drifting out of sync, and matches how real-world language-preference cookies behave (e.g., a declined offer doesn't nag again, but doesn't force a redirect either).

**Alternative considered**: two keys (`asked` + `preferredLang`). Rejected as unnecessary complexity for the same information.

### Shared switch-target computation
Extract the existing `translation_key` counterpart lookup and flag/home-fallback logic (currently inline in `header.html`, lines ~32-62) into a new shared Liquid snippet, e.g. `_includes/snippets/language-switch-context.html`, that assigns `_switch_href`, `_page_lang`, `_other_lang_label`, etc. Both `header.html` (dropdown) and `head/custom.html` (redirect script) include this snippet so the same target is always computed the same way, in one place.

**Alternative considered**: duplicate the Liquid lookup logic in `head/custom.html`. Rejected - two independently-maintained copies of the same lookup is exactly the kind of drift risk already flagged elsewhere in this project (e.g. the `pt_listing_tag.rb`/`article-list.html` split), and would let the banner/redirect and the dropdown compute *different* targets after an edit to one but not the other.

### Where the redirect-check script lives
The auto-redirect check (read `localStorage`, compare to `page.lang`, `window.location.replace(...)` on mismatch) goes in `_includes/head/custom.html`, inside an inline (non-deferred) `<script>` tag. `<head>` content executes during HTML parsing, before the body paints, which minimizes the flash of wrong-language content for a returning visitor who's about to be redirected. It reads `_switch_href` from the shared snippet (computed via Liquid, emitted as a JS string literal) and does nothing if `localStorage` is unavailable (e.g. privacy mode) - wrapped in try/catch.

### Where the suggestion banner lives
The banner's markup, styles, and script go in `_includes/header.html`, alongside the existing switcher's `<style>`/`<script>` blocks - this keeps all language-switching UI in one file rather than spreading it across a new include, matching how the file already owns this concern.

### Detection heuristic
Use `(navigator.languages && navigator.languages[0]) || navigator.language`, the single most-preferred browser language. If it starts with `pt`, treat as a Portuguese preference; if it starts with `en`, treat as an English preference; anything else -> no actionable signal, no banner. This matches the proposal's framing of "the likely language" (a single best guess), not an exhaustive scan of `navigator.languages`.

### Escape hatch for deep links
A `?nolangredirect` query-string parameter (presence check only, value ignored) suppresses the auto-redirect for that page load. This is a standard, low-cost mitigation against the common complaint that language-redirects hijack a specifically shared link, and needs no persistence of its own - it's per-request.

### Banner UI
Fixed-position bar (bottom of viewport), visually consistent with the existing switcher dropdown's dark styling (`#202020` background, subtle border, box-shadow). Two controls: an accept action (label in the suggested language, e.g. "Mudar para Português" / "Switch to English") and a dismiss control (e.g. "×"). Both write to `localStorage` before the accept action also navigates.

## Risks / Trade-offs

- **Deliberate cross-language navigation gets bounced once.** A visitor with a saved Portuguese preference who deliberately clicks an English link (e.g., from a search result) will be immediately redirected to the Portuguese counterpart. If they actually wanted the English page, using the switcher to go back to English updates their saved preference, so this only happens the first time after such a click. This matches common browser-language-redirect behavior on other bilingual sites and is mitigated by the `?nolangredirect` escape hatch for intentionally shared links.
- **`<head>` redirect script runs before `header.html`'s shared snippet include in body.** Both need the same Liquid computation; since Liquid runs at build time (not two separate runtime computations), this is not a race condition - it only means the *snippet* must be included twice (once from each file), which is why it's factored out as a shared, parameterless include rather than duplicated logic.
- **`localStorage` unavailable (privacy mode, disabled storage).** Both the banner and the redirect check wrap `localStorage` access in try/catch and silently no-op on failure - visitors in this situation simply see the site behave as it does today (manual switcher only, no suggestions or redirects).
