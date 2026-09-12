## Purpose

Defines the site's declaration of its own color scheme to the browser, so that browser-level automatic dark-mode/forced-dark features do not apply an additional darkening effect on top of the site's own dark theme.

## ADDED Requirements

### Requirement: Site declares its own color scheme
Every page SHALL declare its supported color scheme via a `color-scheme` meta tag, so browsers with an automatic dark-mode/forced-dark feature can recognize the page already implements dark styling and skip their own darkening heuristic.

#### Scenario: Color-scheme meta tag present
- **WHEN** any page's HTML `<head>` is inspected
- **THEN** it contains `<meta name="color-scheme" content="dark">`

#### Scenario: Page is not over-darkened on a force-dark browser
- **WHEN** the site is loaded on a browser with an automatic dark-mode/force-dark feature for web content (e.g. Samsung Internet, Chromium-based Android browsers with this setting enabled)
- **THEN** the page renders using its own dark theme colors, without an additional browser-applied darkening filter reducing legibility

### Requirement: Theme color matches the site's actual background
The `theme-color` meta tag SHALL match the site's actual rendered background color, not a stock default left over from the theme.

#### Scenario: Theme color reflects the dark skin
- **WHEN** any page's HTML `<head>` is inspected
- **THEN** `<meta name="theme-color">` specifies the dark skin's actual background color, not an unrelated default like white
