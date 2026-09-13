## MODIFIED Requirements

### Requirement: A parallel Portuguese section exists at /pt/
The site SHALL provide Portuguese-language versions of its structural pages (home, archive, about) reachable under the `/pt/` path prefix, using the same layouts as their English counterparts. The archive and about pages SHALL use Portuguese URL slugs (`/pt/arquivo.html`, `/pt/sobre.html`); the old English-slug paths (`/pt/archive.html`, `/pt/about.html`) SHALL NOT resolve.

#### Scenario: Portuguese home page
- **WHEN** a visitor navigates to `/pt/`
- **THEN** they see the home layout rendered with Portuguese UI strings and only Portuguese-scoped post listings

#### Scenario: Portuguese archive and about pages
- **WHEN** a visitor navigates to `/pt/arquivo.html` or `/pt/sobre.html`
- **THEN** they see the corresponding page rendered in Portuguese

#### Scenario: Old English-slug Portuguese URLs no longer resolve
- **WHEN** a visitor navigates to `/pt/archive.html` or `/pt/about.html`
- **THEN** the site returns a 404 rather than the Portuguese archive/about content

### Requirement: Listings are scoped to the current page's language
A page listing posts (home, archive, tag search, pagination stats) SHALL scope its included posts by the listing page's own language: an English listing includes only posts whose effective language is `en`; a Portuguese listing includes every post (per the English-fallback requirement below), except it SHALL omit an English post whose `translation_key` is already represented by a Portuguese sibling post in that same listing, to avoid listing the same content twice.

#### Scenario: English listings show only English-flagged posts
- **WHEN** the English archive or home page is viewed
- **THEN** it lists only posts with effective language `en`

#### Scenario: Portuguese listings show every post, deduplicating paired posts
- **WHEN** `/pt/arquivo.html` or `/pt/` is viewed
- **THEN** it lists every post (English posts using their English-fallback title/link per the requirement below), but for a post pair sharing a `translation_key` it shows only the Portuguese member, not both

### Requirement: A language switcher is available on every page
Every page SHALL offer a visible way to switch to the other language, presented as a dropdown labeled with each language's flag (🇧🇷 Portuguese, 🇺🇸 English): to the paired counterpart's URL when one exists for the current page, or to the other language's home section otherwise. Selecting a language option SHALL prompt the visitor to confirm before navigating; navigation SHALL only occur on confirmation.

#### Scenario: Switcher shows flag-labeled options
- **WHEN** a visitor opens the language switcher dropdown
- **THEN** it shows an option for Portuguese labeled with the Brazilian flag and an option for English labeled with the US flag

#### Scenario: Switching from a paired page
- **WHEN** the current page has a known counterpart in the other language (a page pair, or a post pair via `translation_key`) and the visitor confirms the language switch
- **THEN** the language switcher navigates directly to that counterpart

#### Scenario: Switching from an unpaired page
- **WHEN** the current page has no known counterpart in the other language and the visitor confirms the language switch
- **THEN** the language switcher navigates to the other language's top-level section (`/` for English, `/pt/` for Portuguese)

#### Scenario: Declining the switch confirmation
- **WHEN** a visitor opens the language switcher, selects the other language, but declines the confirmation prompt
- **THEN** the page does not navigate and the visitor remains on the current page
