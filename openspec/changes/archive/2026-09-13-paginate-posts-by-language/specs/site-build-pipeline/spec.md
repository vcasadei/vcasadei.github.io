## MODIFIED Requirements

### Requirement: Build is reproducible across environments
The site SHALL build using a pinned, version-locked set of gem dependencies, so a build run by GitHub Actions resolves the same dependency versions as a local build, rather than depending on whatever versions happen to be latest at build time.

#### Scenario: Dependency versions are pinned
- **WHEN** the automated build installs gem dependencies
- **THEN** it resolves them from a committed lockfile rather than re-resolving latest-compatible versions on every run

#### Scenario: Build installs from this repository's own lockfile
- **WHEN** the automated build runs
- **THEN** it installs gems from this repository's own committed `Gemfile`/`Gemfile.lock`, rather than a fixed dependency set that ignores this repository's `Gemfile` and is bundled independently of it
