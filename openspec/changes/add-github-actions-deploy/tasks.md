## 1. Pin dependencies for reproducible builds

- [x] 1.1 Run `bundle install` locally to generate `Gemfile.lock` and verify it's created with `github-pages`, `jekyll-text-theme`, and `tzinfo-data` resolved
- [x] 1.2 Remove the `Gemfile.lock` line from `.gitignore` and commit the generated `Gemfile.lock`; verify `git status` shows it tracked

## 2. Add the GitHub Actions workflow

- [x] 2.1 Create `.github/workflows/deploy.yml` with a `build` job (checkout → `actions/configure-pages` → `actions/jekyll-build-pages` → `actions/upload-pages-artifact`) that runs on `push` to `master` and on `pull_request`
- [x] 2.2 Add a `deploy` job that depends on `build` (`needs: build`), runs only `if: github.ref == 'refs/heads/master' && github.event_name == 'push'`, uses the `github-pages` environment, and deploys via `actions/deploy-pages`
- [x] 2.3 Set workflow `permissions: { pages: write, id-token: write, contents: read }` and a top-level `concurrency: { group: "pages", cancel-in-progress: false }`, and verify the workflow YAML is valid (e.g. via `actionlint` or a push that triggers a run)

## 3. Cut over the Pages deploy source

- [ ] 3.1 Push the workflow to `master` (or merge via PR) and verify the `build` job succeeds in the Actions tab (build verified passing on PR #1 as of this run: https://github.com/vcasadei/vcasadei.github.io/actions/runs/34660223507 — not yet merged to master)
- [x] 3.2 In repo Settings → Pages, switch the source from "Deploy from a branch" to "GitHub Actions"; verify the setting is saved (`gh api repos/vcasadei/vcasadei.github.io/pages` now reports `"build_type": "workflow"`)
- [ ] 3.3 Trigger a push to `master` (e.g. a trivial content change) and verify the `deploy` job runs and completes successfully
- [ ] 3.4 Load the live site URL and confirm it reflects the latest pushed commit, with no console/build errors

## 4. Validate failure handling and PR checks

- [x] 4.1 Open a throwaway pull request containing a deliberately invalid front-matter/config change and verify the `build` job fails and is reported as a failing check on the PR (done on PR #1 itself rather than a second throwaway PR: pushed an intentionally-corrupted `_config.yml`, confirmed `build fail` / `deploy skipping` via `gh pr checks`, run https://github.com/vcasadei/vcasadei.github.io/actions/runs/34660765933, then reverted with `git revert`, confirmed green again)
- [x] 4.2 Verify that this failing PR build does not affect the currently-deployed live site (previous deploy stays up), then close/discard the throwaway PR (by construction: `master` was never touched during this test — classic GitHub Pages is still what serves the live site until task 3.2's cutover — so there was nothing for the failing build to affect; no separate throwaway PR existed to close since the test ran on PR #1, which stays open pending merge)

## 5. Final verification

- [x] 5.1 Confirm `openspec validate add-github-actions-deploy --strict` passes
- [x] 5.2 Update any local dev docs/notes that mention Docker as a required publish step, clarifying it's now optional/for local preview only
