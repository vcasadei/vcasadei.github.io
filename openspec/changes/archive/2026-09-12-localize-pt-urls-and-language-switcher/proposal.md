## Why

The Portuguese section of the site was added in `add-bilingual-pt-support`, but two rough edges remain: the Portuguese structural pages still use English URL slugs (`/pt/about.html`, `/pt/archive.html`) even though their nav labels are already translated ("Sobre", "Arquivo"), and the language switcher is a bare text link ("PT"/"EN") with no visual language cue and no confirmation before it navigates the visitor away.

## What Changes

- **BREAKING**: `/pt/about.html` becomes `/pt/sobre.html`, and `/pt/archive.html` becomes `/pt/arquivo.html`. The old URLs stop resolving (no redirect) — per owner decision, since both pages have been live only briefly with negligible external inbound links.
- The header's Archive/About nav links on Portuguese pages point at the new localized paths; the English nav and URLs (`/archive.html`, `/about.html`) are unchanged.
- The `page.translation_key` counterpart lookup and any other internal link to these pages (language switcher fallback, sitemap, etc.) are updated to the new paths.
- Replace the plain "PT"/"EN" text link in the header with a dropdown: each option shows a flag (🇧🇷 for Portuguese, 🇺🇸 for English) plus the language name.
- Clicking a language option shows a confirmation ("Switch to Portuguese?" / "Switch to English?") before navigating; navigation only proceeds on confirmation.
- No change to which URL the switcher targets (paired-post/page counterpart, or the other language's top-level section) — only how the option is presented and confirmed.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `site-internationalization`: the Portuguese structural page paths change (`/pt/sobre.html`, `/pt/arquivo.html` instead of the English slugs), and the language switcher requirement gains a richer presentation (flag-labeled dropdown) and a confirmation step before switching.

## Impact

- **Affected files**: `pt/about.md` → renamed `pt/sobre.md` (permalink updated); `pt/archive.html` → renamed `pt/arquivo.html` (permalink updated); `_includes/header.html` (nav hrefs + switcher markup/behavior); a small amount of new inline CSS/JS in that same include (no build pipeline for SCSS/JS exists in this repo, per `migrate-to-theme-gem`'s remote-theme-only setup).
- **Affected systems**: none beyond the static site itself — no build/CI change.
- **No impact** to English pages, posts, or the giscus comment-mapping behavior from `add-bilingual-pt-support`.
