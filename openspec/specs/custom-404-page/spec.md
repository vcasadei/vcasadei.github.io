# custom-404-page Specification

## Purpose

Defines the behavior of the site's custom 404 page, including the embedded Space Invaders game, so it renders correctly no matter how deep the requested (non-existent) URL is and never causes the 404 page to reload or nest itself.

## Requirements

### Requirement: 404 page assets resolve independently of request path depth
The custom 404 page's embedded assets (including the Space Invaders game iframe) SHALL reference paths that resolve to the same location regardless of the depth or content of the non-existent URL that triggered the 404 page.

#### Scenario: Shallow non-existent URL
- **WHEN** a reader requests a non-existent one-segment URL (e.g. `/foo`)
- **THEN** the 404 page's embedded game loads successfully from the site's `assets/space-invaders` path

#### Scenario: Deep non-existent URL
- **WHEN** a reader requests a non-existent, multi-segment URL (e.g. `/2026/09/11/some-missing-post`)
- **THEN** the 404 page's embedded game still loads successfully from the site's `assets/space-invaders` path, resolved the same way as for a shallow URL

### Requirement: 404 page does not recursively re-trigger itself
The custom 404 page SHALL NOT cause the browser to load another copy of the 404 page (nested or repeated) as a side effect of loading its own embedded assets.

#### Scenario: No nested 404 inside the game iframe
- **WHEN** a reader requests any non-existent URL and the 404 page renders
- **THEN** the embedded game iframe loads the actual game content, not another instance of the 404 page
