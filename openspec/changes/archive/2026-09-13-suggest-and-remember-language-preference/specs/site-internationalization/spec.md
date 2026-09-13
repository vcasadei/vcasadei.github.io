## ADDED Requirements

### Requirement: A first-time visitor is suggested the other language when it likely matches them better
When a visitor has no saved language preference yet, the site SHALL compare the visitor's browser-reported language (`navigator.language`/`navigator.languages`) against the current page's effective language, and, when they disagree and the browser language is one the site supports (English or Portuguese), show a small, non-intrusive, dismissible banner suggesting the matching language. The banner's message and action label SHALL be written in the suggested language, not the current page's language. The banner SHALL NOT block interaction with the page and SHALL NOT reappear once the visitor has made any choice (accept or dismiss).

#### Scenario: Browser prefers Portuguese on an English page
- **WHEN** a visitor with no saved preference and a browser language starting with `pt` views an English page
- **THEN** a dismissible banner appears, written in Portuguese, suggesting the Portuguese version

#### Scenario: Browser prefers English on a Portuguese page
- **WHEN** a visitor with no saved preference and a browser language starting with `en` views a Portuguese page
- **THEN** a dismissible banner appears, written in English, suggesting the English version

#### Scenario: Browser language already matches the current page
- **WHEN** a visitor's browser language matches the current page's effective language
- **THEN** no banner is shown

#### Scenario: Browser language is neither English nor Portuguese
- **WHEN** a visitor's browser language does not indicate a preference for English or Portuguese
- **THEN** no banner is shown

#### Scenario: Visitor already has a saved preference
- **WHEN** a visitor already has a saved language preference (from a prior accept, dismiss, or manual switch)
- **THEN** no suggestion banner is shown, regardless of browser language

### Requirement: A visitor's language choice is remembered
The site SHALL persist the visitor's language decision in the browser (`localStorage`) so they are not asked again: accepting the suggestion banner saves the suggested language as the standing preference; dismissing the banner saves an explicit "don't ask again" preference; using the existing language switcher saves the chosen language as the standing preference.

#### Scenario: Accepting the suggestion saves a language preference
- **WHEN** a visitor accepts the suggestion banner
- **THEN** the suggested language is saved as their standing preference, and the banner does not appear again on later visits

#### Scenario: Dismissing the suggestion stops future suggestions
- **WHEN** a visitor dismisses the suggestion banner without accepting
- **THEN** the site remembers that this visitor declined, and the banner does not appear again on later visits

#### Scenario: Manually switching language also saves a preference
- **WHEN** a visitor uses the existing header language switcher to change language
- **THEN** the chosen language is saved as their standing preference, the same as if they had accepted a suggestion banner

### Requirement: A returning visitor with a saved preference is redirected automatically
When a visitor has a saved language preference that differs from the current page's effective language, the site SHALL automatically redirect them, on page load, to that language's paired counterpart for the current page when one exists, or otherwise to that language's top-level section - the same target the language switcher would use. A page loaded with a `nolangredirect` query parameter SHALL be exempt from this automatic redirect, so a deliberately shared link can be viewed as-is.

#### Scenario: Saved preference differs from the current page's language
- **WHEN** a returning visitor with a saved Portuguese preference loads an English page
- **THEN** they are automatically redirected to the Portuguese counterpart of that page, or to the Portuguese home section if no counterpart exists

#### Scenario: Saved preference matches the current page's language
- **WHEN** a returning visitor's saved preference matches the current page's effective language
- **THEN** no redirect happens

#### Scenario: No saved preference exists
- **WHEN** a visitor has no saved language preference (including one who dismissed the suggestion banner)
- **THEN** no automatic redirect happens

#### Scenario: Deep link opts out of auto-redirect
- **WHEN** a page is loaded with a `nolangredirect` query parameter
- **THEN** no automatic redirect happens, even if a saved preference disagrees with the page's language

## MODIFIED Requirements

### Requirement: A language switcher is available on every page
Every page SHALL offer a visible way to switch to the other language, presented as a dropdown labeled with each language's flag (🇧🇷 Portuguese, 🇺🇸 English): to the paired counterpart's URL when one exists for the current page, or to the other language's home section otherwise. Selecting a language option SHALL prompt the visitor to confirm before navigating; navigation SHALL only occur on confirmation. Confirming the switch SHALL also save the chosen language as the visitor's standing language preference, used by the automatic-redirect behavior on future visits.

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
- **THEN** the page does not navigate and the visitor remains on the current page, and no preference is saved

#### Scenario: Confirming the switch saves a standing preference
- **WHEN** a visitor confirms a language switch via the header switcher
- **THEN** the chosen language is saved as their standing preference for future automatic redirects
