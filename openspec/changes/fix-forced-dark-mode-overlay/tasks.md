## 1. Add the color-scheme declaration

- [x] 1.1 Create `_includes/head/custom.html` with `<meta name="color-scheme" content="dark">` (matching the dark skin's actual background color) — **correction**: the `theme-color` fix could not go in `custom.html` too, since the theme's own `head/favicon.html` already emits a (wrong) `theme-color` tag; adding another there would leave two conflicting tags. Instead added a local override of `_includes/head/favicon.html` (identical to the theme's version, with only the `theme-color` value corrected to `#121212`)
- [x] 1.2 Verify the file is picked up as a local override (not shadowed by the remote theme's own empty `head/custom.html`) — relies on the same local-file-takes-precedence-over-remote_theme rule already proven during the `migrate-to-theme-gem` change; actual proof (the meta tags appearing in the built HTML) is confirmed in task 2.2

## 2. Verify via a real build (branch + PR)

- [x] 2.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes (PR #6, run https://github.com/vcasadei/vcasadei.github.io/actions/runs/34719608393)
- [x] 2.2 Download the built artifact and confirm both meta tags appear in the `<head>` of a sample page, and that `theme-color` no longer says `#ffffff` (first pass found a duplicate `theme-color` tag — see the correction above; after fixing, confirmed exactly one `theme-color` tag with `#121212` plus `color-scheme: dark`)
- [x] 2.3 Merge to `master`; confirm the `deploy` job succeeds

## 3. Confirm the color-scheme/theme-color fix live

- [x] 3.1 Load the live site and confirm both meta tags are present in the page source (confirmed on `https://www.vcasadei.com/page/hello-world.html`: `theme-color` = `#121212`, `color-scheme` = `dark`)

## 4. Fix the actual root cause: strip the stray style block from the logo SVG

- [ ] 4.1 Remove the `<style id="style1">@media (prefers-color-scheme: light) {...} @media (prefers-color-scheme: dark) {...}</style>` block from `_includes/svg/logo.svg`; confirm the rest of the SVG markup is untouched
- [ ] 4.2 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes
- [ ] 4.3 Download the built artifact and grep the full site output for `prefers-color-scheme` and `brightness(` — confirm zero matches anywhere (previously found in the inlined logo SVG on every page)
- [ ] 4.4 Merge to `master`; confirm the `deploy` job succeeds
- [ ] 4.5 Confirm live: grep the live homepage HTML for `prefers-color-scheme`/`brightness(` — zero matches
- [ ] 4.6 Ask the user to re-verify visually on the setup that reproduced this (macOS Chrome with OS appearance set to Light, and/or the WhatsApp in-app browser on Android) — this is the real confirmation the bug is gone, since grep only proves the CSS is absent, not that rendering looks correct to a human
- [ ] 4.7 Confirm `openspec validate fix-forced-dark-mode-overlay --strict` passes
