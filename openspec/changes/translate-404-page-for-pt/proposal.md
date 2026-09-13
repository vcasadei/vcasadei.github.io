## Why

Visiting a non-existent URL under `/pt/` (e.g. `https://vcasadei.com/pt/sobre2`) shows the 404 page entirely in English — heading text and nav menu (Archive/About) — even though the visitor was clearly browsing the Portuguese side of the site. GitHub Pages serves a single static `/404.html` for every broken URL on the whole domain regardless of path, so the page has no way to know at build time which language section the visitor came from; this can only be resolved client-side, by inspecting the URL after the page loads.

## What Changes

- Add a small client-side script to the 404 page that detects when the current URL starts with `/pt/`, and in that case:
  - Swaps the 404 heading message to its Portuguese translation.
  - Swaps the "Reload Game" button label to its Portuguese translation.
  - Swaps the primary nav links (Archive → Arquivo, About → Sobre) to both their Portuguese labels and their Portuguese URL destinations (`/pt/arquivo.html`, `/pt/sobre.html`), matching the mapping the header already uses on real Portuguese pages.
- The embedded Space Invaders game (iframe content) is explicitly NOT translated — it stays as-is regardless of detected language.
- Deeper header widgets (search placeholder, the language-suggestion banner, the subscribe/language-switcher dropdown contents) are left in English — out of scope for this change, per user decision.
- Add the new translated strings (404 heading, reload button label) to `_data/locale.yml` under the `en` and `pt-BR` blocks, consistent with how the rest of the site centralizes translated UI strings.

## Capabilities

### Modified Capabilities
- `custom-404-page`: Adds a requirement that the 404 page's message and primary nav reflect a Portuguese context when the requested URL was under `/pt/`.

## Impact

- Affected files: `_layouts/404.html` (client-side detection/swap script), `_data/locale.yml` (new locale keys for the 404 heading and reload-game button).
- No change to the game iframe content itself, to deeper header widgets, or to any English-side behavior (visiting a non-`/pt/` broken URL is unaffected).
