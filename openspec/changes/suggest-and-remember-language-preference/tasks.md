## 1. Extract shared switch-target logic

- [x] 1.1 Create `_includes/snippets/language-switch-context.html` containing the `translation_key` counterpart lookup and flag/label/fallback assignment currently inlined in `_includes/header.html` (the `_page_lang`, `_switch_url`, `_switch_href`, `_current_flag`/`_other_flag`, `_current_lang_label`/`_other_lang_label`, `_switch_confirm` block); verify it assigns the same variables with the same values as before by including it from `header.html` in place of the inline block and confirming a local build produces byte-identical `header` output for a paired post, an unpaired post, and a plain page — done; full-site diff of a build before/after the refactor showed zero HTML differences (only the CSS sourcemap differed, due to an unrelated build-time temp path); no unpaired post currently exists in the repo, so paired posts + plain pages were used
- [x] 1.2 Update `_includes/header.html` to `{%- include snippets/language-switch-context.html -%}` instead of the inlined block; verify `bundle exec jekyll build` succeeds and the language switcher still renders and links correctly on a sample of pages — done; build succeeds, output identical to pre-refactor

## 2. Persist language preference from the manual switcher

- [x] 2.1 Update the `.js-lang-confirm` click handler in `_includes/header.html` to write the confirmed target language (`en` or `pt-BR`) to `localStorage` under a single key (e.g. `langPref`) before navigating; verify by manually switching language in a local build and inspecting `localStorage` in devtools — done; added `_other_lang_code` to the shared snippet and a `data-lang` attribute on the link, confirmed built markup renders `data-lang="pt-BR"`/`"en"` correctly and the click handler writes `langPref` before navigating

## 3. Add the suggestion banner

- [x] 3.1 Add banner markup, styles, and script to `_includes/header.html`: on load, if no `langPref` is saved, compare the top browser language (`navigator.languages[0] || navigator.language`) against the current page's effective language; show a dismissible bottom banner (dark theme, consistent with the existing switcher dropdown styling) written in the suggested language when they disagree and the browser language is `en*` or `pt*`; verify by forcing `navigator.language` in devtools (or via browser language settings) for both directions (EN page + PT browser, PT page + EN browser) and confirming the banner text/labels appear in the suggested language — done; confirmed via build output (EN page banner in Portuguese linking to `/pt/`, PT page banner in English linking to `/`) and a Node harness exercising the extracted detection logic for both directions
- [x] 3.2 Wire the banner's accept action to save the suggested language to `langPref` and navigate to the shared switch-target (reusing the same `_switch_href` from task 1.1), and its dismiss action to save `"none"` to `langPref` without navigating; verify both paths persist the expected value and the banner does not reappear on reload after either action — done; Node harness confirmed accept sets `langPref` to the suggested code and dismiss sets it to `"none"` and hides the banner
- [x] 3.3 Verify the banner does not appear when a `langPref` is already saved, when the browser language matches the current page, or when the browser language is neither English nor Portuguese — done; all three cases verified via the Node harness (existing pref, matching browser language, unsupported browser language)

## 4. Add the auto-redirect for returning visitors

- [x] 4.1 In `_includes/head/custom.html`, include `snippets/language-switch-context.html` and add an inline `<script>` that reads `langPref` from `localStorage` and, if it is set to a real language (`en`/`pt-BR`) different from the current page's effective language, and the URL has no `nolangredirect` query parameter, redirects via `window.location.replace` to the computed switch target; wrap the whole check in try/catch so a `localStorage`-unavailable environment (e.g. privacy mode) silently no-ops; verify by manually setting `langPref` in devtools and reloading both a paired post and an unpaired page in each direction — done; confirmed via build output that the script sits in `<head>`, well before `<body>`, computing `/pt/` and `/` redirect targets correctly on EN/PT home pages, and via a Node harness exercising the extracted redirect logic
- [x] 4.2 Verify no redirect happens when `langPref` matches the current page's language, when `langPref` is absent or `"none"`, or when the URL includes `?nolangredirect`  — done; all four cases (matching pref, absent pref, `"none"` pref, `?nolangredirect` present) verified via the Node harness

## 5. Update documentation

- [x] 5.1 Update `docs/architecture.md`'s bilingual EN/PT-BR system section to describe the new browser-language detection, suggestion banner, `localStorage` preference, and auto-redirect behavior, and the new shared `language-switch-context.html` snippet, verifying the description against the actual implemented code rather than this plan — done; added an "Automatic language detection and preference persistence" subsection, verified against the actual `header.html`/`head/custom.html`/snippet code

## 6. Verify via a real build (branch + PR)

- [x] 6.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes — done; PR #17, `build` passed (31s)
- [x] 6.2 Download the built artifact and confirm `head/custom.html`'s output includes the redirect script and `header.html`'s output includes the banner markup on a sample of built pages — done; downloaded PR #17's `github-pages` artifact, confirmed `lang-suggest-banner` markup and `window.location.replace` redirect script present in the built `index.html`
- [x] 6.3 Confirm no unrelated pages regressed (diff a sample of untouched pages against a master build) — done; full-site diff against the latest master build artifact showed HTML differences only on pages that include `header.html`/`head/custom.html` (the intended additions: redirect script, `data-lang` attribute, banner markup/styles/script), image/CSS-map diffs from non-deterministic build artifacts, and `sitemap.xml` differing only in `<lastmod>` timestamps
- [ ] 6.4 Merge to `master`; confirm the `deploy` job succeeds

## 7. Confirm live

- [ ] 7.1 On the live site, using browser devtools to override `navigator.language` (or actual browser language settings), confirm the suggestion banner appears correctly in both directions (EN page + PT-preferring browser, PT page + EN-preferring browser) and that dismissing or accepting it persists and stops it from reappearing
- [ ] 7.2 On the live site, manually set the `langPref` value in `localStorage` to the opposite of the current page's language and reload, confirming the automatic redirect fires to the correct counterpart or fallback home section, and confirming `?nolangredirect` suppresses it
- [ ] 7.3 Confirm `openspec validate suggest-and-remember-language-preference --strict` passes
