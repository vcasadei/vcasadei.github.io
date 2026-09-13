## MODIFIED Requirements

### Requirement: Listings are scoped to the current page's language
A page listing posts (home, archive, tag search, pagination stats) SHALL scope its included posts by the listing page's own language: an English listing includes only posts whose effective language is `en`; a Portuguese listing includes every post (per the English-fallback requirement below), except it SHALL omit an English post whose `translation_key` is already represented by a Portuguese sibling post in that same listing, to avoid listing the same content twice. This scoping SHALL hold across every page of a paginated listing, not only its first page.

#### Scenario: English listings show only English-flagged posts
- **WHEN** the English archive or home page is viewed
- **THEN** it lists only posts with effective language `en`

#### Scenario: Portuguese listings show every post, deduplicating paired posts
- **WHEN** `/pt/arquivo.html` or `/pt/` is viewed
- **THEN** it lists every post (English posts using their English-fallback title/link per the requirement below), but for a post pair sharing a `translation_key` it shows only the Portuguese member, not both

#### Scenario: Later pages of a paginated home listing remain language-scoped
- **WHEN** a visitor navigates to page 2 (or later) of the English home page
- **THEN** it still lists only posts with effective language `en`, with no Portuguese post interleaved into the page purely because of its date

#### Scenario: Each language paginates its own listing independently
- **WHEN** the English home page has enough English posts to span multiple pages
- **THEN** the Portuguese home page's own page count and page contents are computed only from what belongs in a Portuguese listing, independent of how many pages the English listing needs
