## Purpose

Defines the constraint that this repository's build/deploy automation always targets this blog's own site configuration, so no stray CI pipeline can build or publish the wrong content.

## ADDED Requirements

### Requirement: No CI configuration targets an unrelated site config
The repository SHALL NOT contain CI/CD configuration that builds or deploys a Jekyll config other than this blog's own (root `_config.yml`, or a config that is explicitly a variant of it).

#### Scenario: No Travis configuration deploying the theme demo site
- **WHEN** the repository's root is inspected for CI configuration
- **THEN** no `.travis.yml` (or equivalent) exists that builds `docs/_config.yml` (the vendored theme's demo/documentation site) and deploys it to `gh-pages`

#### Scenario: GitHub Pages remains the sole publishing path
- **WHEN** a commit is pushed to `master`
- **THEN** the only automated publish that occurs is GitHub Pages' own build of the repository's root `_config.yml` — no secondary CI system also attempts to build or deploy a different config
