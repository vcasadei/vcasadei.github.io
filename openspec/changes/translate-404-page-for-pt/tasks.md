## 1. Add translated strings

- [x] 1.1 Add `PAGE_NOT_FOUND` and `RELOAD_GAME` keys to `_data/locale.yml` under the `en` block (English text matching the current hardcoded strings) and the `pt-BR` block (Portuguese translations), and verify (local build) both keys resolve.

## 2. Implement the client-side swap

- [x] 2.1 In `_layouts/404.html`, embed both language variants of the heading and reload-button text (from `_data/locale.yml`) into the page via Liquid, and replace the current hardcoded English strings with the `en` variant as the default rendered text.
- [x] 2.2 Add a script that detects `window.location.pathname.indexOf('/pt/') === 0` and, when true, swaps the heading and reload-button text to the Portuguese variant.
- [x] 2.3 In the same script, when `/pt/` is detected, swap the nav `<a href="/archive.html">` element to `href="/pt/arquivo.html"` with text "Arquivo", and the `<a href="/about.html">` element to `href="/pt/sobre.html"` with text "Sobre".
- [x] 2.4 Verify (local build) that the embedded Space Invaders game iframe is untouched by this script in both the English and Portuguese cases.

## 3. Verify

- [x] 3.1 Run the site locally and load a non-existent URL under `/pt/` (e.g. `/pt/sobre2`); verify the heading, reload button, and nav (Arquivo/Sobre with correct PT hrefs) all show in Portuguese.
- [x] 3.2 Load a non-existent URL outside `/pt/` (e.g. `/foo`); verify the page is unchanged from before this change (English heading, English nav).

## 4. Documentation

- [x] 4.1 Add a note to `docs/architecture.md`'s bilingual-support section describing that the 404 page localizes its heading/nav client-side (by inspecting the URL), since it's the one page that can't use `page.lang` like the rest of the site.
