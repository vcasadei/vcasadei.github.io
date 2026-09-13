## ADDED Requirements

### Requirement: Comments are scoped to blog posts only
The comments system SHALL render only on blog post pages. Non-post pages (including the Home page, the Archive page, the About page, and the 404 page) SHALL NOT render a comment thread, regardless of the theme's page-level default.

#### Scenario: Blog post shows comments
- **WHEN** a reader opens a published blog post
- **THEN** the giscus comment widget loads for that post

#### Scenario: Home page shows no comments
- **WHEN** a reader opens the Home page
- **THEN** no comment widget or section renders

#### Scenario: Archive page shows no comments
- **WHEN** a reader opens the Archive page
- **THEN** no comment widget or section renders

#### Scenario: About page shows no comments
- **WHEN** a reader opens the About page
- **THEN** no comment widget or section renders

#### Scenario: 404 page shows no comments
- **WHEN** a reader is shown the custom 404 page
- **THEN** no comment widget or section renders
