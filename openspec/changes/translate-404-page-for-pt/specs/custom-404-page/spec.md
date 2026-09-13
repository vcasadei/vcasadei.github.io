## ADDED Requirements

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
