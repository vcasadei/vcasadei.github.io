## Why

The site footer shows "© Vitor Casadei's Blog 2025" — a literal, hardcoded year string in `_data/locale.yml`'s `COPYRIGHT_DATES` key (duplicated across all seven locale blocks the theme ships with). It doesn't update automatically; it'll keep reading "2025" indefinitely, through 2026 and beyond, until someone manually edits the data file again.

## What Changes

- Replace the hardcoded `COPYRIGHT_DATES` locale-string lookup in `_includes/footer.html` with a computed value: a fixed start year (2024, when the site's first post was published) through the current year at build time (`site.time | date: '%Y'`), rendered as `2024-2026` (or just `2024` if a build ever happens to run within 2024 itself, though that's already in the past).
- Since GitHub Actions rebuilds the site on every push (and the deploy workflow triggers regularly), this keeps the displayed range current without any further manual edits.
- Remove the now-unused `COPYRIGHT_DATES` key from `_data/locale.yml` (all locale blocks), since a year range isn't language-specific and no longer needs to be part of the translated-string table.

## Capabilities

### New Capabilities
- `site-footer`: Defines what the site's footer must display, including that its copyright year range stays current without manual maintenance.

## Impact

- Affected files: `_includes/footer.html` (computation logic), `_data/locale.yml` (remove now-dead `COPYRIGHT_DATES` keys).
- No visual/layout change beyond the displayed date range text itself.
