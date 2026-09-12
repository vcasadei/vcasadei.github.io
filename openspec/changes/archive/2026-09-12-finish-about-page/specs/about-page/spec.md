## Purpose

Defines what the site's About page must present to a visitor: real, substantive information about the site and its author, not a placeholder.

## ADDED Requirements

### Requirement: About page has real content
The About page (`about.md`) SHALL present substantive information about the site owner and the site's purpose, rather than placeholder text.

#### Scenario: Visitor opens the About page
- **WHEN** a visitor navigates to the About page from the site header
- **THEN** the page shows real biographical/site-purpose content, not a placeholder like "Soon"

#### Scenario: Content reflects publicly-known information
- **WHEN** the About page's content is compared against other public information about the site owner (the site's own `author` metadata, other published posts)
- **THEN** the About page is consistent with that information rather than contradicting it
