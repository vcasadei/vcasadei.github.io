## Context

No `README.md` or `docs/` exists today. The repository has accumulated substantial undocumented behavior across this session's archived changes: `add-bilingual-pt-support`, `localize-pt-urls-and-language-switcher`, `translate-english-posts-to-portuguese`, `optimize-website-images`, and `paginate-posts-by-language`. The `openspec/specs/` directory already captures *behavioral requirements* for these capabilities, but it's written for spec-driven change tracking, not for a newcomer (or the owner, later) who just wants to know "how do I add a post" or "what does this depend on." This proposal is a separate, human-facing documentation layer, not a replacement for the OpenSpec specs.

## Goals / Non-Goals

**Goals:**
- Make the site's architecture, dependencies, and post-authoring workflow discoverable directly in GitHub's file browser, with no build step needed to read them.
- Cover every content feature currently enabled in `_config.yml` (math, Mermaid, charts, syntax highlighting) so the owner has a reference instead of needing to recall or re-discover them.

**Non-Goals:**
- No documentation-freshness enforcement mechanism (e.g., a CI check that fails if code changes without a matching docs update) — worth considering later, not part of this proposal.
- No restructuring of `openspec/specs/` or the OpenSpec workflow itself — this is additive, human-facing documentation alongside it, not a replacement.
- No changes to the site's actual behavior, templates, or workflow beyond the one `_config.yml` `exclude:` addition needed to keep the new files out of the deployed site.

## Decisions

**Location**: a root `docs/` folder, following the common GitHub convention — renders as clickable, navigable markdown directly in the repo's file browser, and reads naturally from a `README.md` table of contents. No `docs/` folder exists today (it was removed as vendored theme scaffolding in an earlier, unrelated change), so there's no naming conflict.

**File boundaries** (avoiding overlap between the four docs):
- `architecture.md`: system-level "how it's built and deployed" — the build pipeline, the theme, the bilingual system's *mechanism*, pagination's *mechanism*. Written for someone asking "how does this whole thing work."
- `dependencies.md`: purely the `Gemfile`/OS-level dependency list and *why* each entry exists — no build-flow narrative (that's `architecture.md`'s job).
- `writing-posts.md`: the practical, step-by-step "I want to publish a new post" workflow — file location, front matter, excerpt marker, translation pairing. Assumes the reader doesn't care how pagination or the theme works internally.
- `post-features.md`: a feature-by-feature content-authoring reference (math, diagrams, code, tables, embeds) with a minimal working example for each — a lookup reference, not a narrative.

**README contents**: project name/description, a live-site link, a GitHub Actions build/deploy status badge (`![Build and deploy](.../workflows/deploy.yml/badge.svg)`, pointed at the existing `deploy.yml` workflow), an MIT license badge (the repo's committed `LICENSE`, originally the theme author's, still accurately describes this repo's license terms), and a short table of contents linking into `docs/`. No visitor/traffic-count stat is included — GitHub doesn't expose that via a public, no-auth badge, and anything else considered (open-issue count, last-commit date) was judged as noise for a single-owner personal blog rather than a genuinely useful signal; build status is the one stat that's both meaningful and cheap.

**Keeping `docs/`/`README.md` out of the deployed site**: add both to `_config.yml`'s existing `exclude:` list (already used for `Gemfile`, `Gemfile.lock`, `LICENSE`, etc.) — without front matter, Jekyll would otherwise copy them into `_site` verbatim as unstyled, unlinked static files, which is harmless but pointless clutter in the deployed output.

## Risks / Trade-offs

- [Documentation drifts out of date as future changes land] → Accepted as an ordinary maintenance cost, same as any project's docs; not solving this with automation now (see Non-Goals).
- [Duplicating some detail between `openspec/specs/` and `docs/`] → Acceptable: the two serve different readers (spec-driven change tracking vs. a newcomer/owner reference) and light duplication between them is preferable to forcing one reader to learn OpenSpec's format just to find out how to add a post.
