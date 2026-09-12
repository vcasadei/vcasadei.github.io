## Purpose

Defines the site's bilingual (English default, Portuguese/pt-BR secondary) structure: per-page language declaration, language-scoped listings, pairing an English post with its Portuguese counterpart (with fallback to English when no counterpart exists), a language switcher, and shared comments across a paired post's language versions.

## ADDED Requirements

### Requirement: Every page and post declares a language
Every page and post SHALL have an effective language (`en` by default, `pt-BR` when explicitly set), used to select UI strings and to scope listings.

#### Scenario: Untagged content defaults to English
- **WHEN** a page or post has no `lang` front matter
- **THEN** its effective language is `en`

#### Scenario: Portuguese content is explicitly tagged
- **WHEN** a page or post is intended as the Portuguese version of something
- **THEN** it sets `lang: pt-BR` in its front matter

### Requirement: A parallel Portuguese section exists at /pt/
The site SHALL provide Portuguese-language versions of its structural pages (home, archive, about) reachable under the `/pt/` path prefix, using the same layouts as their English counterparts.

#### Scenario: Portuguese home page
- **WHEN** a visitor navigates to `/pt/`
- **THEN** they see the home layout rendered with Portuguese UI strings and only Portuguese-scoped post listings

#### Scenario: Portuguese archive and about pages
- **WHEN** a visitor navigates to `/pt/archive.html` or `/pt/about.html`
- **THEN** they see the corresponding page rendered in Portuguese

### Requirement: Listings are scoped to the current page's language
A page listing posts (home, archive, tag search, pagination stats) SHALL only include posts whose effective language matches the listing page's own language.

#### Scenario: English listings show only English-flagged posts
- **WHEN** the English archive or home page is viewed
- **THEN** it lists only posts with effective language `en`

#### Scenario: Portuguese listings show only Portuguese-flagged posts
- **WHEN** `/pt/archive.html` or `/pt/` is viewed
- **THEN** it lists only posts with effective language `pt-BR`

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
Every page SHALL offer a visible way to switch to the other language: to the paired counterpart's URL when one exists for the current page, or to the other language's home section otherwise.

#### Scenario: Switching from a paired page
- **WHEN** the current page has a known counterpart in the other language (a page pair, or a post pair via `translation_key`)
- **THEN** the language switcher links directly to that counterpart

#### Scenario: Switching from an unpaired page
- **WHEN** the current page has no known counterpart in the other language
- **THEN** the language switcher links to the other language's top-level section (`/` for English, `/pt/` for Portuguese)

### Requirement: Comments are shared between paired posts
An English post and its paired Portuguese counterpart SHALL show the same comment thread, regardless of which language version a reader comments from.

#### Scenario: Comment mapping for paired posts
- **WHEN** a post has a `translation_key`
- **THEN** its comment widget maps to a thread identified by that shared `translation_key`, the same one its counterpart uses

#### Scenario: Comment mapping for unpaired posts
- **WHEN** a post has no `translation_key`
- **THEN** its comment widget maps to a thread identified by its own unique `key`, unaffected by any other post
