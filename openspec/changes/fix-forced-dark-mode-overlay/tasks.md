## 1. Add the color-scheme declaration

- [x] 1.1 Create `_includes/head/custom.html` with `<meta name="color-scheme" content="dark">` (matching the dark skin's actual background color) — **correction**: the `theme-color` fix could not go in `custom.html` too, since the theme's own `head/favicon.html` already emits a (wrong) `theme-color` tag; adding another there would leave two conflicting tags. Instead added a local override of `_includes/head/favicon.html` (identical to the theme's version, with only the `theme-color` value corrected to `#121212`)
- [x] 1.2 Verify the file is picked up as a local override (not shadowed by the remote theme's own empty `head/custom.html`) — relies on the same local-file-takes-precedence-over-remote_theme rule already proven during the `migrate-to-theme-gem` change; actual proof (the meta tags appearing in the built HTML) is confirmed in task 2.2

## 2. Verify via a real build (branch + PR)

- [x] 2.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes (PR #6, run https://github.com/vcasadei/vcasadei.github.io/actions/runs/34719608393)
- [ ] 2.2 Download the built artifact and confirm both meta tags appear in the `<head>` of a sample page, and that `theme-color` no longer says `#ffffff`
- [ ] 2.3 Merge to `master`; confirm the `deploy` job succeeds

## 3. Confirm the fix live

- [ ] 3.1 Load the live site and confirm both meta tags are present in the page source
- [ ] 3.2 If possible, verify on a browser/device with a force-dark or "dark mode for web contents" setting that the page no longer shows the over-darkened rendering (best-effort — depends on having access to an affected browser to re-test)
- [ ] 3.3 Confirm `openspec validate fix-forced-dark-mode-overlay --strict` passes
