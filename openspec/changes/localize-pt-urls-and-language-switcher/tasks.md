## 1. Localize the Portuguese page URLs

- [x] 1.1 `git mv pt/about.md pt/sobre.md`; update its `permalink:` to `/pt/sobre.html`; verify no other front matter changed — confirmed, only `permalink:` changed
- [x] 1.2 `git mv pt/archive.html pt/arquivo.html`; update its `permalink:` to `/pt/arquivo.html`; verify no other front matter changed — confirmed, only `permalink:` changed
- [x] 1.3 Replace `_includes/header.html`'s `'/pt' | append: _item_url` nav-href logic with an explicit mapping from each English nav path to its Portuguese equivalent (`/archive.html` → `/pt/arquivo.html`, `/about.html` → `/pt/sobre.html`); verify by inspecting the rendered nav markup in a test build (task 4) shows the new hrefs on Portuguese pages — implemented with a fallback branch (keeps the old `/pt`-prepend behavior for any future, unmapped nav item) so a third nav item degrades gracefully instead of producing a broken link; rendered-markup verification deferred to task 3.2's build check
- [x] 1.4 Grep the repo for any other hardcoded reference to `/pt/about.html` or `/pt/archive.html` and update it; verify zero remaining matches — confirmed zero matches outside `openspec/`

## 2. Redesign the language switcher

- [x] 2.1 Replace the plain `<a class="language-switch">` in `_includes/header.html` with a `<button>` that toggles a small dropdown `<ul>` of two options: 🇧🇷 Português and 🇺🇸 English, following the design's button+list approach; verify the dropdown opens/closes on click and closes on an outside click — implemented as a vanilla-JS toggle (`js-lang-toggle`/`js-lang-menu`, no jQuery/Lazyload dependency, per design's no-build-pipeline constraint); the current language is shown as a disabled indicator and the other language as the clickable option, so both flags are always visible per the spec's "Switcher shows flag-labeled options" scenario. Live open/close/outside-click behavior verification deferred to task 4.2 (requires a real browser against a deployed build)
- [x] 2.2 Wire each option's target URL using the existing paired-counterpart/fallback logic already in `header.html` (unchanged targeting, only new presentation); verify the same target URLs computed before this change still resolve for a paired post, an unpaired post, and the `/pt/`⇄`/` fallback case — the pre-existing `_switch_url`/`_switch_href` computation is untouched, only reused inside the new dropdown markup; resolution verification deferred to task 3.2's build artifact check
- [x] 2.3 Add a `confirm()` gate before navigating: selecting a language option prompts to confirm, and navigation only proceeds on confirmation; verify by testing both confirm and cancel in a browser against the deployed test build (task 4) — implemented via a `click` handler on the `.js-lang-confirm` link that calls `window.confirm()` and `preventDefault()`s on cancel; live confirm/cancel verification deferred to task 4.2

## 3. Verify via a real build (branch + PR)

- [x] 3.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes — PR #10, `build` passed
- [x] 3.2 Download the built artifact and check: `/pt/sobre.html` and `/pt/arquivo.html` exist and render correctly; `/pt/about.html` and `/pt/archive.html` are absent from the build output; the Portuguese pages' nav Archive/About links point at the new slugs — all confirmed; also confirmed the switcher on a paired post (HackTown) links directly to its counterpart, not the `/pt/` fallback
- [x] 3.3 Confirm no unrelated pages regressed (diff a sample of untouched pages against a master build) — diffed index/about/scrum4research/404/feed/sitemap; all diffs were exactly the new switcher markup + sitewide `<style>`/`<script>` block, nothing else
- [x] 3.4 Merge to `master`; confirm the `deploy` job succeeds

## 4. Confirm live

- [ ] 4.1 Load `/pt/sobre.html` and `/pt/arquivo.html` live and confirm they render correctly; confirm `/pt/about.html` and `/pt/archive.html` now 404
- [ ] 4.2 In a live browser, open the language switcher dropdown on an English page and a Portuguese page; confirm both flag-labeled options appear, selecting one prompts for confirmation, cancelling stays on the page, and confirming navigates to the correct counterpart/fallback URL
- [ ] 4.3 Confirm `openspec validate localize-pt-urls-and-language-switcher --strict` passes
