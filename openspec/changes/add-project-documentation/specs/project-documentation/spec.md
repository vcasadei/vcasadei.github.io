## Purpose

Defines the repository's own documentation: what must exist, where it lives, and what it must cover, so the site's architecture, dependencies, and post-authoring workflow are discoverable directly on GitHub without needing to read the Jekyll source or run a build.

## ADDED Requirements

### Requirement: A repository README exists and is discoverable
The repository SHALL have a root `README.md` that GitHub renders on the repository's front page, identifying the project, linking to the live site, and showing the current build/deploy status.

#### Scenario: Visiting the repository shows the README
- **WHEN** a visitor opens the repository's GitHub page
- **THEN** the rendered `README.md` is shown, including a link to the live site and a badge reflecting the current status of the build/deploy GitHub Actions workflow

### Requirement: Architecture and dependencies are documented
The repository SHALL document, in `docs/`, how the site is built and deployed (the Jekyll build pipeline, the remote theme, the bilingual system, and per-language pagination) and what its runtime/build dependencies are and why each exists.

#### Scenario: A reader can find how the build pipeline works
- **WHEN** a reader opens `docs/architecture.md`
- **THEN** it describes the GitHub Actions build/deploy pipeline, the remote theme, the bilingual (EN/PT-BR) post-pairing system, and the per-language pagination mechanism

#### Scenario: A reader can find what the project depends on
- **WHEN** a reader opens `docs/dependencies.md`
- **THEN** it lists the gems in the `Gemfile` and the reason each is present, plus any OS-level tools the build relies on

### Requirement: Adding a new post is documented
The repository SHALL document, in `docs/`, the concrete steps and front-matter fields needed to add a new post, including how to pair it with a translation.

#### Scenario: A reader can find how to add a new post
- **WHEN** a reader opens `docs/writing-posts.md`
- **THEN** it describes the post file naming/location convention, the front-matter fields in current use, and how to pair an English post with its Portuguese translation via `translation_key`

### Requirement: Post-authoring content features are documented
The repository SHALL document, in `docs/`, every content feature a post body can use that is currently enabled in `_config.yml` or already used by an existing post, including math notation.

#### Scenario: A reader can find out that math notation is supported
- **WHEN** a reader opens `docs/post-features.md`
- **THEN** it documents that MathJax is enabled and how to write inline and block math in a post

#### Scenario: A reader can find every other enabled content feature
- **WHEN** a reader opens `docs/post-features.md`
- **THEN** it also documents Mermaid diagrams, Chart.js charts, syntax-highlighted code blocks, footnotes, tables, the table of contents, and how to embed an image or video, each with a working example
