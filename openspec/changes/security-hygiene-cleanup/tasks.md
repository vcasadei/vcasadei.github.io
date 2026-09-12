## 1. Giscus prerequisites (manual, outside repo)

- [x] 1.1 Enable GitHub Discussions on the repo that will back comments (default: `vcasadei/vcasadei.com`) and verify a Discussions tab appears on GitHub (enabled via `gh api -X PATCH repos/vcasadei/vcasadei.github.io -f has_discussions=true`; confirmed `has_discussions: true`)
- [x] 1.2 Install the giscus GitHub App on that repo via https://github.com/apps/giscus and verify it shows installed under the repo's Settings → Integrations (done by the user; functional confirmation deferred to task 2.3 since the API token here can't list app installations)
- [x] 1.3 Generate the giscus config (repo, repo ID, category, category ID, mapping) via https://giscus.app and record the generated `data-*` values for use in step 2.2 (pulled directly via GitHub GraphQL instead of the giscus.app UI, since it returns the same values: repo `vcasadei/vcasadei.github.io`, repo-id `R_kgDON0X3bQ`, category `Announcements`, category-id `DIC_kwDON0X3bc4DFc7k` — Announcements is giscus's own recommended category since it keeps random visitors from opening unrelated top-level discussions)

## 2. Wire up giscus in the theme

- [x] 2.1 Add a `comments.giscus` block to `_config.yml` (repo, repo-id, category, category-id, mapping, theme) and set `comments.provider: custom`; verify `_config.yml` still parses (`bundle exec jekyll build` succeeds)
- [x] 2.2 Populate `_includes/comments-providers/custom.html` with the giscus `<script src="https://giscus.app/client.js">` embed, reading values from `site.comments.giscus.*`, guarded the same way other providers are (only render when required config values are present)
- [x] 2.3 Serve the site locally (`bundle exec jekyll serve`) and verify the giscus widget loads and is mapped to the current page on at least one article (local Ruby 4.0/Jekyll 3.9 can't run `jekyll serve` — see the `add-github-actions-deploy` change for why; verified instead via a PR branch build, confirmed live on `https://www.vcasadei.com/page/hello-world.html`)
- [x] 2.4 Verify no comment widget network request fires when `JEKYLL_ENV=development` (matching the existing `jekyll.environment != 'development'` gate in `_includes/comments.html`) — confirmed `_includes/comments.html` is unmodified and still wraps the `custom` include in that gate

## 3. Remove Gitalk and its credential

- [x] 3.1 Remove the `comments.gitalk` block (including `clientID`/`clientSecret`) from `_config.yml`; verify `git grep -i clientSecret` and `git grep gitalk _config.yml` return nothing
- [ ] 3.2 Revoke/delete the GitHub OAuth App backing Gitalk (`clientID: Ov23lin6IyLAkbPd4m3v`) in GitHub Settings → Developer settings → OAuth Apps; verify the app no longer appears in the account's OAuth Apps list
- [x] 3.3 Confirm no other file in the repo references `site.comments.gitalk` (`git grep -n "comments.gitalk"`) and remove/update any that do (e.g. leftover references in docs, if any apply to this site rather than the vendored theme docs) — only hits are `_includes/comments-providers/gitalk.html` (inert vendored theme scaffolding, same category as unused `disqus.html`/`valine.html`, left in place) and a stale mention in `openspec/project.md`, now updated to reflect the fix

## 4. Remove the stale Travis pipeline

- [x] 4.1 Delete `.travis.yml` from the repo root
- [x] 4.2 Verify no other config references Travis for this repo (`git grep -il travis`) and that removing it doesn't affect anything beyond the vendored theme's demo-site deploy (which was already unused for this blog) — remaining hits are `README.md`/`README-zh.md` (upstream theme docs, already excluded from the build) and `openspec/project.md` (updated to reflect the removal)
- [x] 4.3 Confirm GitHub Pages still builds and publishes the site normally after the change (check Pages build status after merge, or via a PR preview if available) — confirmed via Actions run after merge, live site loads (200)

## 5. Final verification

- [x] 5.1 Confirm `openspec validate security-hygiene-cleanup --strict` passes
- [x] 5.2 Manually load a live (or local-served) blog post and confirm the giscus comment box renders where Gitalk used to be, and that no Gitalk script/error appears in the browser console (confirmed live at `https://www.vcasadei.com/page/hello-world.html`; also confirmed in the build output that no `Lazyload` call ever references gitalk's CDN URL and the old `gitalk-wrapper` container is gone, replaced by `giscus-wrapper`)
- [x] 5.3 Confirm `_config.yml` contains zero plaintext secrets (`git grep -iE "secret|clientSecret" _config.yml` returns nothing) — only match is the comment "No secret required" describing giscus itself, not a credential
