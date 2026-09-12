## Context

See `proposal.md` - Why. Relevant current state:

- `Gemfile` uses the `github-pages` gem (which pins Jekyll + plugin versions to whatever GitHub Pages' own build environment supports) plus `jekyll-text-theme` and `tzinfo-data`.
- No `Gemfile.lock` exists, locally or in git (`.gitignore` explicitly ignores it). Every build — local or otherwise — currently re-resolves gem versions from scratch.
- Local Ruby is 2.6.10 (old; matches classic `github-pages` gem support). No `.ruby-version` file is present to pin a version for tooling.
- `.github/` currently has only issue templates — no workflows.
- There is a still-pending `security-hygiene-cleanup` change that deletes the stale `.travis.yml`. That deletion and this change's new workflow are independent and don't conflict (Travis wasn't doing anything real for this site's publish path).
- Repo Pages settings currently must be on "Deploy from a branch" (classic GitHub Pages Jekyll build) since that's the only way the site could be publishing without any existing Actions workflow.

## Goals / Non-Goals

**Goals:**
- Push to `master` → site builds and deploys with zero manual/local steps.
- A build-breaking change is caught on the pull request, not after it's live.
- Builds are reproducible (same gem versions locally and in CI).
- Minimal new moving parts — reuse GitHub's own maintained Pages/Jekyll actions rather than hand-rolling Ruby setup.

**Non-Goals:**
- Removing Docker/`docker/` tooling from the repo (tracked separately as a repo-cleanup debt item; this change only makes Docker optional for publishing, not deletes it).
- Changing what gets built (theme, plugins, content) — only how/where the build+deploy runs.
- Adding staging/preview-URL deploys for pull requests (PRs only get a build check, not a deployed preview) — could be a future enhancement, out of scope here.
- De-vendoring the theme or restructuring `_config.yml`'s `exclude:` list — unrelated to the build pipeline itself.

## Decisions

**Use GitHub's official `actions/jekyll-build-pages` action for the build step, not a hand-rolled `ruby/setup-ruby` + `bundle install` + `bundle exec jekyll build` sequence.**
This action is maintained by GitHub specifically for repos using the `github-pages` gem: it runs the same containerized build GitHub Pages' classic "deploy from a branch" mode used to run, so switching to Actions doesn't silently change Jekyll/plugin versions or behavior out from under the site. Alternative considered: manually pin a Ruby version and run `bundle install`/`bundle exec jekyll build` — rejected as more moving parts to maintain (a Ruby version to keep current, more surface for local-vs-CI drift) for no capability this repo needs beyond what the official action already gives it.

**Single workflow file with two jobs — `build` (always) and `deploy` (only on `master`) — rather than two separate workflow files.**
Keeps the build-validation and deploy behavior visibly coupled (same artifact produced by the same build job is what gets deployed) and matches GitHub's own Pages+Jekyll starter workflow shape. `deploy` depends on `build` via `needs:` and is additionally gated with `if: github.ref == 'refs/heads/master'`, so PR runs execute `build` only.

**Commit `Gemfile.lock`.**
Required for the "reproducible build" requirement in the spec: without a committed lockfile, `bundle install` re-resolves versions every run, so a CI build and a later local build (or two CI runs weeks apart) can silently diverge if an unpinned gem ships a new release. Generating it is a one-time `bundle install` locally; `.gitignore`'s `Gemfile.lock` line is removed as part of this change (scoped narrowly to this line, not the whole `.gitignore`).

**Switch Pages source to "GitHub Actions" (repo Settings → Pages) as a manual, one-time step alongside merging the workflow.**
This is a GitHub repo setting change, not something expressible in a committed file, so it's called out explicitly as a task rather than left implicit. Until it's flipped, the classic branch-based Pages build and the new Actions workflow would both try to publish, which is exactly the "two publish paths" failure mode this change exists to eliminate — so the setting change and the first workflow run should happen together, not the setting left stale.

**Use `concurrency` to prevent overlapping deploys.**
Two pushes to `master` in quick succession (or a re-run) could otherwise race to deploy; GitHub's Pages deploy action model expects a single in-flight deployment. A `concurrency: group: "pages", cancel-in-progress: false` block (matching GitHub's own starter workflow) queues rather than cancels, so no deploy is silently dropped.

## Risks / Trade-offs

- **[Risk]** Switching the Pages source setting is a manual, undo-able-but-easy-to-forget step outside of git → **Mitigation**: called out as an explicit task with a verification step (confirm Settings → Pages shows "GitHub Actions" as the source, and that a test push actually deploys via the new workflow) rather than assumed to follow automatically from adding the workflow file.
- **[Risk]** First `bundle install` to generate `Gemfile.lock` happens on whatever local Ruby (2.6.10) is at hand, which may resolve older gem versions than a fresher environment would → **Mitigation**: acceptable — the goal is *reproducibility*, not "latest possible versions"; a future deliberate `bundle update` can move the pin forward.
- **[Risk]** `actions/jekyll-build-pages` abstracts away the underlying Ruby/Jekyll version, so a future change to that action's defaults could shift build behavior without a change to this repo → **Mitigation**: accepted trade-off in exchange for not having to hand-maintain a Ruby version; this is the same trust relationship the repo already has with GitHub Pages' classic build today.
- **[Trade-off]** No PR preview deploy — reviewers only see "build passed/failed," not a live preview of the change → accepted as out of scope; can be revisited later if wanted.
