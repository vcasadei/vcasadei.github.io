## MODIFIED Requirements

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
