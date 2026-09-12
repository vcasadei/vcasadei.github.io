## Why

Publishing today requires manually starting Docker, building the Jekyll site locally, and then pushing/uploading before GitHub Pages picks it up. This is slow, error-prone (nothing stops a broken build from being pushed), and depends on the author's local machine having Docker and the right Ruby/Jekyll setup. Automating the build and deploy through GitHub Actions removes the manual step entirely: pushing to `master` becomes the only action needed to publish.

## What Changes

- **BREAKING**: Switch the repo's GitHub Pages source from "Deploy from a branch" to **"GitHub Actions"** in repo Settings → Pages. Once switched, GitHub Pages only serves what an Actions workflow explicitly publishes — the implicit "Pages builds whatever's on `master` automatically" behavior goes away and must be replaced by the workflow below.
- Add a GitHub Actions workflow (`.github/workflows/deploy.yml`) that, on every push to `master`:
  1. Checks out the repo
  2. Sets up Ruby/Bundler and installs gems (`bundle install`)
  3. Builds the site (`bundle exec jekyll build`, with `JEKYLL_ENV=production`)
  4. Uploads the built `_site/` as a Pages artifact (`actions/upload-pages-artifact`)
  5. Deploys that artifact to GitHub Pages (`actions/deploy-pages`)
- Add the same build step (checkout → bundle install → jekyll build) to pull requests, so a broken build fails the PR before it ever reaches `master` — a single workflow with a build job (runs always) and a deploy job (runs only on `master`) covers both.
- Commit `Gemfile.lock` (currently git-ignored) so the Actions build resolves the exact same gem versions every run instead of "whatever bundler picks at build time." Uncommitted lockfiles make CI builds non-reproducible and are the main way a local build and a CI build silently diverge.
- Local Docker-based building becomes optional (useful for local preview) rather than a required step before every publish.

## Capabilities

### New Capabilities
- `site-build-pipeline`: How this repository's source is built and published — specifically, that the build and deploy happen via an automated, version-pinned GitHub Actions workflow rather than a manual local build-then-upload step.

  Note: this same capability path is also introduced (with different, narrower requirements — "no CI targets the wrong config") by the still-pending `security-hygiene-cleanup` change, which has not yet been applied/archived. No `openspec/specs/site-build-pipeline/spec.md` exists yet, so both changes currently declare it as new. Whichever change is archived first creates the main spec; the second archive will need to reconcile as a modification rather than a fresh creation. Flagging this now so it isn't a surprise at archive time.

### Modified Capabilities
(none — no existing archived specs predate this change)

## Impact

- **Affected files**: new `.github/workflows/deploy.yml`; `Gemfile.lock` added to git (removed from `.gitignore`); GitHub repo Settings → Pages (source changed to "GitHub Actions"); `docker/`, `Dockerfile.dev` become optional/legacy local-dev tooling rather than part of the required publish path (not deleted by this change — see the separate repo-cleanup debt item for that).
- **Affected systems**: GitHub Actions (new), GitHub Pages deploy source setting, Ruby/Bundler dependency resolution (now pinned via committed lockfile).
- **User-facing**: none directly — the published site's content and URLs are unchanged. The only behavior change is *how* a push becomes a live deploy.
- **Workflow-facing**: the author's publish process changes from "Docker build locally → push/upload" to "push to `master` → Actions builds and deploys automatically"; broken builds now fail visibly in Actions/PR checks instead of silently landing (or requiring local catch) in production.
