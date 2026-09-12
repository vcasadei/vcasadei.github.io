# blog-comments Specification

## Purpose

Defines how readers can comment on blog articles, and the constraints on how that commenting system is configured — in particular, that it never requires a secret credential to be committed to the site's source repository.

## Requirements

### Requirement: No comment-provider credentials committed to the repository
The comments system SHALL be configurable and operable without any server-side secret (client secret, API key, or private token) being stored in the repository's tracked source files.

#### Scenario: Repository contains no comment-provider secret
- **WHEN** the repository's tracked files (including `_config.yml`) are inspected
- **THEN** no comment-provider client secret, API key, or private token is present in plaintext

#### Scenario: Legacy Gitalk credential is invalidated
- **WHEN** the comments system is switched away from Gitalk
- **THEN** the GitHub OAuth App backing the old Gitalk integration (`clientID: Ov23lin6IyLAkbPd4m3v`) is revoked or deleted, so the previously-committed secret can no longer be used even though it remains in git history

### Requirement: Readers can post and view comments via GitHub Discussions
Blog articles SHALL support a comment thread backed by GitHub Discussions, rendered via giscus, requiring only public, non-secret configuration values (repo, repo ID, category, category ID).

#### Scenario: Comment widget loads on a published article
- **WHEN** a reader opens a published blog post in a normal (non-development) environment
- **THEN** a giscus comment widget loads for that page, backed by the configured GitHub Discussions repository

#### Scenario: Comments disabled in local/dev environment
- **WHEN** the site is served in the `development` Jekyll environment
- **THEN** no comment widget network request is made (matching existing behavior for other providers, gated by `jekyll.environment != 'development'`)

#### Scenario: Per-page comment mapping
- **WHEN** two different articles are viewed
- **THEN** each article's giscus thread is mapped to a distinct GitHub Discussion (not a single shared thread across all pages)

### Requirement: Historical comments are not silently presented as current
Since existing Gitalk-era comments (stored as GitHub issues) are not migrated to Discussions, the system SHALL NOT display stale or broken comment UI where the old provider used to render.

#### Scenario: Old Gitalk comment thread no longer renders
- **WHEN** a reader opens a post that previously had Gitalk comments
- **THEN** the page shows the new (empty, until readers post) giscus thread rather than an error, a broken widget, or the old Gitalk UI
