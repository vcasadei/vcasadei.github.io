# site-footer Specification

## Purpose

Defines what the site's footer must display, in particular that its copyright year range always reflects the current year without requiring a manual edit at each year change.

## Requirements

### Requirement: Footer copyright year range stays current automatically
The footer SHALL display a copyright year range starting from the site's launch year (2024) through the current year at build time, computed automatically rather than read from a hardcoded string.

#### Scenario: Built in a later year than launch
- **WHEN** the site is built in a year after 2024 (e.g. 2026)
- **THEN** the footer shows "2024-2026" (start year through the build year)

#### Scenario: Rebuilt on every deploy
- **WHEN** the site is rebuilt and redeployed (e.g. via the GitHub Actions workflow triggered by a push)
- **THEN** the displayed end year reflects the year of that build, with no manual edit required
