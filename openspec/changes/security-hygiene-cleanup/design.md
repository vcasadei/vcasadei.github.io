## Context

See `proposal.md` - Why. Relevant current state:

- `_config.yml` has `comments.provider: gitalk` with a plaintext `clientID`/`clientSecret`, `repository: comments`, `owner: vcasadei`, `admin: [vcasadei]`.
- `_includes/comments.html` dispatches on `site.comments.provider` to one of `comments-providers/{disqus,gitalk,valine,custom}.html`. `custom.html` is currently an empty stub — the theme's designated extension point for providers it doesn't ship natively.
- Loading of third-party JS/CSS elsewhere in the theme goes through `window.Lazyload` + `snippets/get-sources.html` (a `sources:`-keyed CDN map in `_config.yml`/`_data/variables.yml`), but giscus doesn't need that mechanism — it's a single `<script>` tag with `data-*` attributes hosted at `https://giscus.app/client.js`, no CDN indirection required.
- `.travis.yml` at repo root builds `docs/_config.yml` (the vendored theme's own demo/docs site) and deploys to `gh-pages`. It is disconnected from how this blog is actually published (GitHub Pages building the root config directly) and is not referenced by anything else in the repo.

## Goals / Non-Goals

**Goals:**
- Eliminate the committed secret and the risk of it being (re)used, not just hide it going forward.
- Land a comment system that needs zero repo-committed secrets, using the theme's existing extension points rather than forking/modifying vendored theme files.
- Remove the dead Travis pipeline without affecting the real GitHub Pages publish path.

**Non-Goals:**
- Migrating historical Gitalk comments (stored as issues in `vcasadei/comments`) into Discussions. Out of scope; called out as user-facing impact in the proposal.
- Building a from-scratch giscus theme provider parallel to `disqus`/`valine`/`gitalk` — using the existing `custom` hook is sufficient and lower-maintenance.
- Adding a GitHub Actions build-check workflow (a reasonable follow-up, but a separate concern from removing the stale Travis config; not bundled into this change).

## Decisions

**Use the theme's `comments.provider: custom` hook instead of adding a new `comments-providers/giscus.html` file.**
`_includes/comments-providers/custom.html` is already the theme's sanctioned "drop your own embed here" file (currently an empty stub with start/end comment markers). Using it means zero changes to vendored theme dispatch logic (`comments.html`), and it is what the theme authors intend for exactly this situation. Alternative considered: add `comments-providers/giscus.html` and a matching branch in `comments.html` — rejected because it modifies vendored theme code, which conflicts with the goal (recorded separately in `openspec/project.md`) of eventually treating the theme as an upstream dependency rather than in-repo forked source.

**Use giscus's plain `<script>` embed (no Lazyload/CDN-sources indirection).**
Giscus is loaded via a single `<script src="https://giscus.app/client.js" data-repo="..." ...>` tag maintained by the giscus project itself. Routing it through the theme's `Lazyload`/`sources:` CDN-mirroring system (built for swapping bootcdn/unpkg for libraries like Gitalk/Chart.js/MathJax) would add indirection with no benefit, since giscus has no CDN-mirroring concern — it's a single first-party script from `giscus.app`.

**Config surfaced via a new `comments.giscus` block in `_config.yml`, read directly in `custom.html`.**
Mirrors how `comments.gitalk` / `comments.valine` blocks are structured today (config in `_config.yml`, consumed via `site.comments.<provider>.*` in the provider include), for consistency with the rest of `_config.yml` even though `custom.html` isn't dispatched-to by provider name the same way.

**Revoke the Gitalk GitHub OAuth App rather than just deleting it from config.**
The secret has been in a public repo's git history; removing it from `_config.yml` going forward does not invalidate it. The OAuth App itself must be deleted/regenerated on GitHub so the leaked secret is dead, not just no longer referenced.

**Delete `.travis.yml` outright rather than repointing it at the root `_config.yml`.**
GitHub Pages already builds and deploys the real site on every push to `master` with zero extra configuration. Standing up Travis as a second, parallel build of the same config would be redundant automation to maintain (secrets/tokens to manage, another place to go stale) for no behavior GitHub Pages doesn't already provide. If a pre-merge build check is wanted later, a lightweight GitHub Actions "build only, don't deploy" workflow is the better fit — tracked as a possible follow-up, not part of this change.

## Risks / Trade-offs

- **[Risk]** Discussions must be enabled on the target GitHub repo and the giscus GitHub App installed before the embed will work → **Mitigation**: call out as an explicit manual pre-req step in tasks.md, verify by loading a live post after config lands.
- **[Risk]** Readers lose visibility into prior Gitalk-era comment history → **Mitigation**: accepted and documented in proposal.md as an explicit, non-migrated impact; no in-scope mitigation.
- **[Risk]** The already-leaked Gitalk client secret remains in git history even after revocation and config removal → **Mitigation**: revoking the OAuth App (not just editing config) neutralizes the leaked value; rewriting git history is explicitly out of scope (disruptive, low value once the App is revoked).
- **[Trade-off]** Using the `custom` provider hook means giscus isn't a formal theme "provider" alongside disqus/valine/gitalk (no dedicated `comments.provider == 'giscus'` branch) → accepted, since it avoids touching vendored theme dispatch code; documented here so future readers understand why giscus config lives under `custom` rather than its own named branch.

## Migration Plan

1. Enable GitHub Discussions on the target repo and install the giscus GitHub App; obtain `data-repo-id` / `data-category-id` via giscus.app's config generator.
2. Add `comments.giscus` block to `_config.yml`; set `comments.provider: custom`.
3. Populate `_includes/comments-providers/custom.html` with the giscus `<script>` embed, reading values from `site.comments.giscus.*`.
4. Remove the `comments.gitalk` block from `_config.yml`.
5. Revoke/delete the Gitalk GitHub OAuth App (`clientID: Ov23lin6IyLAkbPd4m3v`).
6. Verify comments render on a live post (or local build) before/after the switch.
7. Delete `.travis.yml`.
8. Confirm GitHub Pages build/publish still succeeds after these changes (push to a branch/PR preview if available, or verify Pages build status after merge to `master`).

Rollback: if giscus embedding fails, revert `_config.yml`/`custom.html` changes via git revert; this does not require restoring Gitalk since the OAuth App is being revoked either way regardless of comment-provider choice.

## Open Questions

- Should comments live on `vcasadei/vcasadei.com` (the site repo itself) or a separate repo, mirroring the current Gitalk setup's use of a dedicated `comments` repo? Either works for giscus; can be decided at implementation time without affecting specs or task breakdown (task will parameterize the repo name).
