## Purpose

Defines how the site's raster image assets are optimized for delivery: every deployed image SHALL be compressed and available in WebP, a smaller thumbnail variant SHALL exist for listing use, and the original, uncompressed source images SHALL remain unchanged in version control.

## ADDED Requirements

### Requirement: Deployed images are recompressed, originals stay untouched in git
Every raster image (JPEG/PNG) under `assets/images/` SHALL be recompressed to a bounded maximum dimension and quality before being deployed, without altering the corresponding source file committed in the repository.

#### Scenario: A deployed image is smaller than its source
- **WHEN** an image under `assets/images/` is deployed
- **THEN** the deployed file at that image's path is recompressed (bounded dimensions and quality), while the file committed in the repository's git history is unchanged

### Requirement: Every raster image has a WebP counterpart
For every raster image deployed under `assets/images/`, a WebP version of that same image SHALL also be deployed at the same path with a `.webp` extension.

#### Scenario: A JPEG image has a deployed WebP sibling
- **WHEN** `assets/images/foo/bar.jpeg` is deployed
- **THEN** `assets/images/foo/bar.webp` is also deployed, depicting the same image

### Requirement: A thumbnail variant exists for listing use
For every raster image used as a post's `cover`, a smaller thumbnail variant SHALL be deployed, in both the original format and WebP, suitable for use in a post-listing card without loading the full-size image.

#### Scenario: A cover image has a deployed thumbnail
- **WHEN** a post's `cover` front-matter image is deployed
- **THEN** a thumbnail-sized variant of it is also deployed, in both its original format and WebP

### Requirement: Post listings that show covers use the thumbnail, not the full-size image
A page listing that displays a post's cover image (e.g. the home page) SHALL render the thumbnail variant, offering the WebP thumbnail first with an original-format thumbnail fallback, rather than loading the full-size cover image.

#### Scenario: Home page listing loads a thumbnail
- **WHEN** the home page listing renders a post's cover image
- **THEN** the browser is offered the WebP thumbnail first, falling back to the original-format thumbnail, and never loads the full-size cover image for that purpose

### Requirement: Local content images use their optimized WebP form
An inline content image referenced by a post body SHALL link to its local, WebP-optimized form rather than an external or absolute URL back to the same repository.

#### Scenario: A post's inline image link is local and WebP
- **WHEN** a post body includes an inline image that exists under this repository's `assets/images/`
- **THEN** the post links to that image via a local relative path to its `.webp` variant, not an absolute URL to an external host (including this repository's own raw-content URLs)
