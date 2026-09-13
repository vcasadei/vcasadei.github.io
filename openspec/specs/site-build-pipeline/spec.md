# site-build-pipeline Specification

## Purpose

Defines how this repository's Jekyll source is built and published: publishing SHALL be an automated result of pushing to `master`, not a manual local build-and-upload step, and a broken build SHALL be caught before it reaches the live site.

## Requirements

### Requirement: Pushing to master automatically builds and deploys the site
Pushing a commit to `master` SHALL trigger an automated build of the Jekyll site and, on success, deploy the built output to GitHub Pages, with no manual local build or upload step required. The automated build SHALL include optimizing the site's image assets before the Jekyll build runs.

#### Scenario: Push to master triggers a deploy
- **WHEN** a commit is pushed to `master`
- **THEN** an automated workflow builds the site from the repository's Gemfile/`_config.yml` and publishes the resulting output to GitHub Pages without any local action by the author

#### Scenario: Successful deploy is reflected live
- **WHEN** the automated build for a `master` push completes successfully
- **THEN** the deployed site at the site's live URL reflects that commit's content

#### Scenario: Image optimization runs before the Jekyll build
- **WHEN** the automated build runs
- **THEN** it recompresses, WebP-converts, and thumbnails the site's raster images (per the `image-asset-pipeline` capability) before invoking the Jekyll build, so the build step deploys the already-optimized image files like any other static asset

### Requirement: A broken build is caught before publishing
The build SHALL run and be validated on proposed changes (pull requests) as well as on `master`, so a change that fails to build is visible before it can reach the live site.

#### Scenario: Pull request with a broken build fails visibly
- **WHEN** a pull request is opened with a change that breaks the Jekyll build (e.g. invalid front matter or config)
- **THEN** the automated build check on that pull request fails and is visible to the author before merge

#### Scenario: A failed build on master does not publish
- **WHEN** a push to `master` fails to build
- **THEN** the previous successfully-deployed version of the site remains live, and the broken build is not published

### Requirement: Build is reproducible across environments
The site SHALL build using a pinned, version-locked set of gem dependencies, so a build run by GitHub Actions resolves the same dependency versions as a local build, rather than depending on whatever versions happen to be latest at build time.

#### Scenario: Dependency versions are pinned
- **WHEN** the automated build installs gem dependencies
- **THEN** it resolves them from a committed lockfile rather than re-resolving latest-compatible versions on every run

### Requirement: No CI configuration targets an unrelated site config
The repository SHALL NOT contain CI/CD configuration that builds or deploys a Jekyll config other than this blog's own (root `_config.yml`, or a config that is explicitly a variant of it).

#### Scenario: No Travis configuration deploying the theme demo site
- **WHEN** the repository's root is inspected for CI configuration
- **THEN** no `.travis.yml` (or equivalent) exists that builds `docs/_config.yml` (the vendored theme's demo/documentation site) and deploys it to `gh-pages`

#### Scenario: GitHub Pages remains the sole publishing path
- **WHEN** a commit is pushed to `master`
- **THEN** the only automated publish that occurs is GitHub Pages' own build of the repository's root `_config.yml` — no secondary CI system also attempts to build or deploy a different config
