# theme-integration Specification

## Purpose

Defines how this site consumes the jekyll-TeXt-theme: as a `remote_theme` dependency with only genuinely-customized files kept as local overrides, rather than a fully-vendored copy of the theme's source — and the constraint that this consumption model must not change the site's rendered output or behavior.

## Requirements

### Requirement: Theme is consumed as a remote dependency, not vendored source
The site SHALL resolve its base theme (layouts, includes, Sass, default assets) from the upstream jekyll-TeXt-theme repository via `remote_theme`, rather than from a locally committed full copy of the theme's source.

#### Scenario: Theme resolves via remote_theme
- **WHEN** the site is built
- **THEN** `_config.yml` specifies `remote_theme: kitian616/jekyll-TeXt-theme` and the build resolves theme layouts/includes/Sass from that source for any path not present locally

#### Scenario: Build environment supports the mechanism
- **WHEN** the site is built via the project's GitHub Actions workflow
- **THEN** the build succeeds using `jekyll-remote-theme` (a dependency already present in the `github-pages` gem's supported plugin set), without requiring an unsupported theme gem

### Requirement: Local overrides preserve customized behavior
Only files that are genuinely customized relative to the upstream theme SHALL be kept as local overrides; a local file at a given path SHALL take precedence over the remote theme's file at that same path, preserving the site's customized behavior unchanged.

#### Scenario: Customized files still take effect
- **WHEN** the site is built after migrating to `remote_theme`
- **THEN** every behavior previously provided by a locally-vendored, customized file (e.g. the Space Invaders 404 page, the giscus comment embed, the homepage cover-image display, the removed theme attribution footer line, custom branding assets) is still present and unchanged

#### Scenario: Unmodified vendored files are removed
- **WHEN** the local theme footprint is audited against the upstream theme source
- **THEN** files with no meaningful difference from the upstream theme are deleted rather than kept as redundant local copies

### Requirement: Migration does not change site output
Switching the theme's consumption model SHALL NOT introduce any observable change to the site's rendered pages, styling, or behavior beyond what is explicitly intended by this change.

#### Scenario: Built output is equivalent before and after
- **WHEN** the site is built before and after this migration and the two outputs are compared
- **THEN** rendered HTML/CSS for existing pages is equivalent aside from incidental differences already present upstream (e.g. non-functional markup or locale-data drift explicitly called out as accepted in this change)
