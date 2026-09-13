## Why

Visitors who land on a page in the "wrong" language for them (e.g. a Portuguese speaker landing on an English post) have no way to discover the site is bilingual unless they happen to notice the small flag switcher in the header. We want to proactively suggest the other language based on the visitor's browser language, in a non-intrusive, dismissible way (like a cookie-consent banner), and remember whatever the visitor decides so returning visits automatically honor their preference without asking again.

## What Changes

- Add client-side browser-language detection (`navigator.language`/`navigator.languages`) that runs on every page load.
- Add a small, dismissible, non-intrusive banner (styled like a cookie-consent notice) offering to switch language, shown only when: the visitor has no saved preference yet, and their detected browser language disagrees with the current page's language. The banner's text and action label are written in the *suggested* language (the language the visitor is presumed to understand), not the current page's language.
- Persist the visitor's decision in `localStorage`: accepting the suggestion or explicitly using the existing header language switcher saves that language as the standing preference; dismissing the banner saves an explicit "don't ask again" preference. Both paths stop the banner from appearing again.
- Add automatic redirection for returning visitors: on every page load, if a saved language preference exists and differs from the current page's effective language, redirect to that language's paired counterpart (or its language's home section as a fallback), the same target the manual language switcher would use.
- Provide an escape hatch (a `?nolangredirect` query parameter) so a deliberately shared/deep-linked page can be viewed without being auto-redirected.
- Extract the existing language-switcher's target-resolution logic (paired-counterpart lookup with home-section fallback) in `_includes/header.html` into a shared Liquid snippet, so both the header switcher and the new early-running redirect script (which needs to run before the header renders, to minimize a wrong-language flash) compute the same target consistently.
- Update the existing header language switcher so a manual switch also updates the same saved preference used for auto-redirection, keeping the two mechanisms from fighting each other.

## Capabilities

### Modified Capabilities
- `site-internationalization`: adds browser-language detection with a dismissible suggestion banner, persistent preference storage, and preference-based auto-redirect on return visits; extends the existing language-switcher requirement so a manual switch also updates the saved preference.

## Impact

- `_includes/header.html`: refactor to use a new shared snippet for switch-target resolution; update the manual switcher's confirm handler to persist the chosen language.
- New shared Liquid snippet (e.g. `_includes/snippets/language-switch-context.html`) for switch-target resolution, reusable from both the header and the early redirect script.
- `_includes/head/custom.html`: add the early-running redirect-check script (executes in `<head>`, before body paint, to minimize a wrong-language flash for returning visitors).
- New include for the suggestion banner's markup/styles/script (or an addition to `header.html`, consistent with where language-switching UI already lives).
- No server-side changes — this is a fully static-site, client-side (`localStorage` + `navigator.language`) feature, consistent with GitHub Pages hosting.
- `docs/architecture.md` will need a documentation update describing the new detection/suggestion/auto-redirect behavior (per `openspec/config.yaml`'s docs-sync rule).
