## Why

Two issues surfaced while documenting the project (`openspec/project.md`) put the blog's security posture and build hygiene at risk: a live GitHub OAuth App client secret is committed in plaintext in `_config.yml` (used by the Gitalk comment system), and a stale `.travis.yml` is configured to build and deploy the *theme's demo site* (`docs/_config.yml`) to `gh-pages` rather than this blog — dead automation that could misfire if Travis CI is ever reconnected to this repo. Both are fixable now, before either causes an incident (credential leak, or an accidental publish of the wrong site).

## What Changes

- **BREAKING**: Remove Gitalk as the comment provider and replace it with **giscus** (GitHub Discussions-backed commenting). This removes the committed OAuth client secret entirely (giscus needs no server-side secret) and moves off an unmaintained library (Gitalk) onto an actively maintained one.
  - Retire the `comments.gitalk` block in `_config.yml` (including the committed `clientID`/`clientSecret`).
  - Revoke/delete the existing GitHub OAuth App backing Gitalk (`clientID: Ov23lin6IyLAkbPd4m3v`) once giscus is live, so the leaked secret is not just replaced but invalidated.
  - Add a `comments.giscus` config block and wire the giscus embed script through the theme's existing `comments.provider: custom` hook (`_includes/comments-providers/custom.html`), since the vendored TeXt theme has no built-in giscus provider and `custom` is the theme's designated extension point for exactly this case.
  - Enable GitHub Discussions on the `vcasadei/vcasadei.com` repo (or a dedicated repo) and install the giscus GitHub App, as required by giscus.
  - Existing Gitalk-era comments (stored as GitHub issues in the `vcasadei/comments` repo) are not migrated — historical comments will no longer display after the switch. This is called out explicitly as it's user-facing and irreversible without manual work.
- Remove `.travis.yml`. GitHub Pages already builds and publishes this site directly from the root `_config.yml` on push to `master`; the Travis config only builds/deploys the unrelated `docs/` demo site and has no legitimate role in this repo. (Assumption: "remove" rather than "fix" — there is no need for a second, redundant deploy pipeline once Pages already publishes the real config; if you'd rather keep Travis wired to build *this* site's own config as a pre-Pages CI check, flag it and we'll adjust scope.)

## Capabilities

### New Capabilities
- `blog-comments`: The blog's reader-comments system — how comments are hosted, authenticated, and configured, and the constraint that no comment-provider credentials are committed to the repository.
- `site-build-pipeline`: How this repository's source is built and published, and the constraint that any configured build/deploy automation in this repo must target this site's own build config, not an unrelated one.

### Modified Capabilities
(none — no existing specs predate this change)

## Impact

- **Affected files**: `_config.yml` (comments block), `.travis.yml` (deleted), `_includes/comments.html` and `_includes/comments-providers/` (new giscus partial), `_data/variables.yml` / `sources` block if a giscus script source needs registering.
- **Affected systems**: GitHub OAuth Apps (Gitalk app to be revoked), GitHub Discussions + giscus GitHub App (new dependency), Travis CI (integration removed).
- **User-facing**: existing blog comments (Gitalk/issues-backed) will no longer be visible after the switch to giscus; new comments will use GitHub Discussions via giscus.
- **No impact** to posts, layouts unrelated to comments, or the Space Invaders 404 page.
