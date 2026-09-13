# site-internationalization Specification

## Purpose

Defines the site's bilingual (English default, Portuguese/pt-BR secondary) structure: per-page language declaration, language-scoped listings, pairing an English post with its Portuguese counterpart (with fallback to English when no counterpart exists), a language switcher, and shared comments across a paired post's language versions.

## Requirements

### Requirement: Every page and post declares a language
Every page and post SHALL have an effective language (`en` by default, `pt-BR` when explicitly set), used to select UI strings and to scope listings.

#### Scenario: Untagged content defaults to English
- **WHEN** a page or post has no `lang` front matter
- **THEN** its effective language is `en`

#### Scenario: Portuguese content is explicitly tagged
- **WHEN** a page or post is intended as the Portuguese version of something
- **THEN** it sets `lang: pt-BR` in its front matter

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

### Requirement: An English post can be paired with a Portuguese counterpart
The system SHALL support an optional `translation_key` front-matter field; when an English post and a Portuguese post both declare the same `translation_key` value, they SHALL be treated as the same content in two languages.

#### Scenario: Paired posts share a translation_key
- **WHEN** an English post and its full Portuguese translation both exist
- **THEN** both set the same `translation_key` value in their front matter

#### Scenario: Unpaired posts have no translation_key
- **WHEN** an English post has no Portuguese translation
- **THEN** it has no `translation_key`, and no corresponding Portuguese post exists for it

### Requirement: Posts without a Portuguese translation fall back to English
The Portuguese-language listings SHALL show every post's title (translated), but SHALL link directly to the English post's own URL when no Portuguese translation exists for it.

#### Scenario: Untranslated post shown with English fallback
- **WHEN** a post has a `title_pt` but no corresponding Portuguese post/`translation_key`
- **THEN** the Portuguese listing shows the translated title (`title_pt`) as the link text, but the link's destination is the English post's own URL

#### Scenario: Translated post links to its Portuguese version
- **WHEN** a post has both a `title_pt` and a paired Portuguese post via `translation_key`
- **THEN** the Portuguese listing links to the Portuguese post's own URL

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

### Requirement: Comments are shared between paired posts
An English post and its paired Portuguese counterpart SHALL show the same comment thread, regardless of which language version a reader comments from.

#### Scenario: Comment mapping for paired posts
- **WHEN** a post has a `translation_key`
- **THEN** its comment widget maps to a thread identified by that shared `translation_key`, the same one its counterpart uses

#### Scenario: Comment mapping for unpaired posts
- **WHEN** a post has no `translation_key`
- **THEN** its comment widget maps to a thread identified by its own unique `key`, unaffected by any other post
