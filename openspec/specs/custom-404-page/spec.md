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

### Requirement: 404 page is always shown to the visitor
The custom 404 page SHALL render and remain visible to the visitor, regardless of any saved site preference (such as a remembered language preference) that might otherwise trigger a client-side redirect away from the current page.

#### Scenario: Visitor with a saved language preference hits a non-existent URL
- **WHEN** a visitor with a saved language preference different from the 404 page's default language requests a non-existent URL (e.g. under `/pt/`)
- **THEN** the custom 404 page is displayed, and the visitor is not redirected to a language home page or any other page

### Requirement: 404 page reflects a Portuguese context for /pt/ URLs
When the requested URL that triggered the 404 page starts with `/pt/`, the custom 404 page SHALL display its heading message and its primary navigation links (Archive, About) in Portuguese, with the nav links pointing to their Portuguese-URL counterparts. For any other URL, the 404 page SHALL display in English as before. The embedded Space Invaders game SHALL NOT be translated in either case.

#### Scenario: Non-existent URL under /pt/
- **WHEN** a reader requests a non-existent URL starting with `/pt/` (e.g. `/pt/sobre2`)
- **THEN** the 404 page's heading message is shown in Portuguese, and the primary nav shows "Arquivo" linking to `/pt/arquivo.html` and "Sobre" linking to `/pt/sobre.html`

#### Scenario: Non-existent URL outside /pt/
- **WHEN** a reader requests a non-existent URL that does not start with `/pt/` (e.g. `/foo`)
- **THEN** the 404 page's heading message is shown in English, and the primary nav shows "Archive" linking to `/archive.html` and "About" linking to `/about.html`

#### Scenario: Embedded game is never translated
- **WHEN** the 404 page renders, regardless of whether the Portuguese or English variant is shown
- **THEN** the embedded Space Invaders game's content is unaffected and identical in both cases
