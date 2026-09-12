## Purpose

Defines how this repository's Jekyll source is built and published: publishing SHALL be an automated result of pushing to `master`, not a manual local build-and-upload step, and a broken build SHALL be caught before it reaches the live site.

## ADDED Requirements

### Requirement: Pushing to master automatically builds and deploys the site
Pushing a commit to `master` SHALL trigger an automated build of the Jekyll site and, on success, deploy the built output to GitHub Pages, with no manual local build or upload step required.

#### Scenario: Push to master triggers a deploy
- **WHEN** a commit is pushed to `master`
- **THEN** an automated workflow builds the site from the repository's Gemfile/`_config.yml` and publishes the resulting output to GitHub Pages without any local action by the author

#### Scenario: Successful deploy is reflected live
- **WHEN** the automated build for a `master` push completes successfully
- **THEN** the deployed site at the site's live URL reflects that commit's content

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
