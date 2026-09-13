## 1. Localize the Portuguese page URLs

- [ ] 1.1 `git mv pt/about.md pt/sobre.md`; update its `permalink:` to `/pt/sobre.html`; verify no other front matter changed
- [ ] 1.2 `git mv pt/archive.html pt/arquivo.html`; update its `permalink:` to `/pt/arquivo.html`; verify no other front matter changed
- [ ] 1.3 Replace `_includes/header.html`'s `'/pt' | append: _item_url` nav-href logic with an explicit mapping from each English nav path to its Portuguese equivalent (`/archive.html` → `/pt/arquivo.html`, `/about.html` → `/pt/sobre.html`); verify by inspecting the rendered nav markup in a test build (task 4) shows the new hrefs on Portuguese pages
- [ ] 1.4 Grep the repo for any other hardcoded reference to `/pt/about.html` or `/pt/archive.html` and update it; verify zero remaining matches

## 2. Redesign the language switcher

- [ ] 2.1 Replace the plain `<a class="language-switch">` in `_includes/header.html` with a `<button>` that toggles a small dropdown `<ul>` of two options: 🇧🇷 Português and 🇺🇸 English, following the design's button+list approach; verify the dropdown opens/closes on click and closes on an outside click
- [ ] 2.2 Wire each option's target URL using the existing paired-counterpart/fallback logic already in `header.html` (unchanged targeting, only new presentation); verify the same target URLs computed before this change still resolve for a paired post, an unpaired post, and the `/pt/`⇄`/` fallback case
- [ ] 2.3 Add a `confirm()` gate before navigating: selecting a language option prompts to confirm, and navigation only proceeds on confirmation; verify by testing both confirm and cancel in a browser against the deployed test build (task 4)

## 3. Verify via a real build (branch + PR)

- [ ] 3.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes
- [ ] 3.2 Download the built artifact and check: `/pt/sobre.html` and `/pt/arquivo.html` exist and render correctly; `/pt/about.html` and `/pt/archive.html` are absent from the build output; the Portuguese pages' nav Archive/About links point at the new slugs
- [ ] 3.3 Confirm no unrelated pages regressed (diff a sample of untouched pages against a master build)
- [ ] 3.4 Merge to `master`; confirm the `deploy` job succeeds

## 4. Confirm live

- [ ] 4.1 Load `/pt/sobre.html` and `/pt/arquivo.html` live and confirm they render correctly; confirm `/pt/about.html` and `/pt/archive.html` now 404
- [ ] 4.2 In a live browser, open the language switcher dropdown on an English page and a Portuguese page; confirm both flag-labeled options appear, selecting one prompts for confirmation, cancelling stays on the page, and confirming navigates to the correct counterpart/fallback URL
- [ ] 4.3 Confirm `openspec validate localize-pt-urls-and-language-switcher --strict` passes
