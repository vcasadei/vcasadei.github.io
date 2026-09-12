## 1. Pin dependencies for reproducible builds

- [x] 1.1 Run `bundle install` locally to generate `Gemfile.lock` and verify it's created with `github-pages`, `jekyll-text-theme`, and `tzinfo-data` resolved
- [x] 1.2 Remove the `Gemfile.lock` line from `.gitignore` and commit the generated `Gemfile.lock`; verify `git status` shows it tracked

## 2. Add the GitHub Actions workflow

- [x] 2.1 Create `.github/workflows/deploy.yml` with a `build` job (checkout → `actions/configure-pages` → `actions/jekyll-build-pages` → `actions/upload-pages-artifact`) that runs on `push` to `master` and on `pull_request`
- [x] 2.2 Add a `deploy` job that depends on `build` (`needs: build`), runs only `if: github.ref == 'refs/heads/master' && github.event_name == 'push'`, uses the `github-pages` environment, and deploys via `actions/deploy-pages`
- [x] 2.3 Set workflow `permissions: { pages: write, id-token: write, contents: read }` and a top-level `concurrency: { group: "pages", cancel-in-progress: false }`, and verify the workflow YAML is valid (e.g. via `actionlint` or a push that triggers a run)

## 3. Cut over the Pages deploy source

- [ ] 3.1 Push the workflow to `master` (or merge via PR) and verify the `build` job succeeds in the Actions tab
- [ ] 3.2 In repo Settings → Pages, switch the source from "Deploy from a branch" to "GitHub Actions"; verify the setting is saved
- [ ] 3.3 Trigger a push to `master` (e.g. a trivial content change) and verify the `deploy` job runs and completes successfully
- [ ] 3.4 Load the live site URL and confirm it reflects the latest pushed commit, with no console/build errors

## 4. Validate failure handling and PR checks

- [ ] 4.1 Open a throwaway pull request containing a deliberately invalid front-matter/config change and verify the `build` job fails and is reported as a failing check on the PR
- [ ] 4.2 Verify that this failing PR build does not affect the currently-deployed live site (previous deploy stays up), then close/discard the throwaway PR

## 5. Final verification

- [x] 5.1 Confirm `openspec validate add-github-actions-deploy --strict` passes
- [x] 5.2 Update any local dev docs/notes that mention Docker as a required publish step, clarifying it's now optional/for local preview only
