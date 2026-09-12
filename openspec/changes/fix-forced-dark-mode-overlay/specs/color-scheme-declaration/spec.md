## Purpose

Defines the site's declaration of its own color scheme to the browser, and the constraint that no page element (including inlined custom assets) may unintentionally alter the rendering of the page outside its own visual bounds — together ensuring the site is never rendered darker or less legible than its own dark theme intends.

## ADDED Requirements

### Requirement: Inlined custom assets do not affect page-wide rendering
A custom asset (e.g. an inlined SVG) included on a page SHALL NOT apply CSS that affects any element outside that asset's own visual bounds. In particular, an inlined asset's own stylesheet SHALL NOT target `:root` or otherwise assume it will be loaded as a standalone document, since inlining makes `:root` resolve to the host page's root element.

#### Scenario: Site is not over-darkened regardless of OS color scheme preference
- **WHEN** the site is loaded with the visitor's OS/browser set to prefer either light or dark color scheme
- **THEN** the page renders using its own intended dark theme colors, with no additional darkening or brightness filter applied to the page as a whole

#### Scenario: Custom logo SVG has no page-wide side effects
- **WHEN** the site's custom logo SVG (`_includes/svg/logo.svg`) is inspected
- **THEN** it contains no `<style>` block that selects `:root` or otherwise applies rules beyond its own SVG content

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
