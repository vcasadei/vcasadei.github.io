# Technical Debt & Deferred Refactors

Tracks known debt and improvements that aren't currently scheduled as OpenSpec changes. See `openspec/project.md` for the full project overview these items were sourced from.

## Repo cleanup (biggest structural issue)

- [ ] **Strip vendored theme scaffolding that isn't this site's content.** `docs/`, `test/`, `screenshots/`, `tools/`, `README-zh.md`, `CHANGELOG.md`, `HOW_TO_RELEASE.md`, `jekyll-text-theme.gemspec`, `docker/` + `Dockerfile.dev` (unless Docker is actually used locally) are all upstream jekyll-TeXt-theme project artifacts, not blog content. They're already excluded from the Jekyll build, but they clutter the repo, confuse navigation, and add noise to git history/diffs. (`.travis.yml` — originally on this list — was removed by the `security-hygiene-cleanup` change.)
- [ ] **Migrate off a fully-vendored theme to a proper Jekyll theme gem** (`remote_theme` or the `jekyll-text-theme` gem) instead of carrying the full theme source in-repo. Keep only `_config.yml`, `_posts/`, `_data/`, `about.md`, `assets/images`, and any Sass overrides in the repo. Bigger effort than the cleanup above, but it's the real fix — future theme updates become a `bundle update` instead of a manual merge, and this item is a prerequisite for #1 to stick (otherwise vendored theme files creep back in).

## Content

- [ ] **Finish `about.md`** — currently just the placeholder text "Soon".
- [ ] **Fix the stray post filename** `_posts/2024-09-20-improving-home-security-using-ai copy.md` — the " copy" suffix suggests an accidental duplicate/rename artifact. Rename it properly and check there isn't an orphaned duplicate of this post elsewhere.
- [ ] **Posting cadence** — no posts since September 2024. Not a code issue, just flagging if the blog is meant to stay active.

## CI/CD

- [x] ~~Add a GitHub Actions build-check workflow that runs `bundle exec jekyll build` on PRs~~ — done by the `add-github-actions-deploy` change: every push/PR now builds via Actions, and `master` pushes auto-deploy to GitHub Pages.

## Security

- [ ] **12 open Dependabot alerts** on transitive gem dependencies (surfaced once `Gemfile.lock` was committed by `add-github-actions-deploy` — Dependabot couldn't do version-specific scanning without a lockfile before):
  - **`activesupport`** (6 alerts, 5 medium + 1 low): possible DoS in number helpers, XSS in `SafeBuffer#%`/`#bytesplice`, ReDoS in `number_to_delimited`/`underscore`, possible disclosure of locally-encrypted files
  - **`commonmarker`** (5 alerts, 1 high + 4 medium): quadratic-complexity/DoS bugs in Markdown parsing, unbounded resource exhaustion in the autolink extension, integer overflow in table parsing leading to heap memory corruption (the high-severity one)
  - **`rake`** (1 alert, medium): OS command injection
  - All three are transitive (pulled in via `github-pages`/`jekyll-text-theme`, not hand-picked), and all are build-time-only tooling — none of them run in a visitor's browser or serve live requests, so real-world exploitability for a single-author personal blog is low (e.g. the Rake command-injection and `commonmarker` parsing bugs need attacker-controlled input at build time, which for this repo just means the posts you write yourself). Still worth patching where the dependency tree allows it, or explicitly accepting/dismissing what can't be bumped without pulling `github-pages` off its Pages-compatible pin.
  - See https://github.com/vcasadei/vcasadei.github.io/security/dependabot for live status.

## Nice-to-have / polish

- [ ] **Lean into the Space Invaders 404 game** — it's already the one genuinely custom feature on the site. Ideas: persist a high score via `localStorage`, add a link back home in a game-over state.
- [ ] **Custom visual identity** — the site is currently the stock TeXt-theme dark skin with no overrides (`_sass/custom.scss` is empty). Fine as-is, but that file is the starting point if a distinct look is wanted later.
