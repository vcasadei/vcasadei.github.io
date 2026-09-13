## 1. Hello World!

- [x] 1.1 Add `translation_key: hello-world` to `_posts/2024-06-30-hello-world.md`'s front matter
- [x] 1.2 Create `_posts/pt/2024-06-30-ola-mundo.md`: AI-drafted full Portuguese translation of the body, front matter per design.md (`title: Olá, Mundo!`, `lang` via defaults, `translation_key: hello-world`, `key: hello-world-pt`, `cover` copied unchanged); verify the file exists with all required front-matter fields present — done; kept the body's `[About](#about)` link's target as-is (translated only its visible text to "Sobre"), matching the English original's own pre-existing fragment link rather than fixing it as part of a translation task

## 2. Scrum for Applied Research

- [x] 2.1 Add `translation_key: scrum-for-applied-research` to `_posts/2024-07-31-scrum4research.md`'s front matter
- [x] 2.2 Create `_posts/pt/2024-07-31-scrum-para-pesquisa-aplicada.md`: AI-drafted full Portuguese translation (code blocks/technical terms left untranslated per design.md), matching front-matter pattern; verify the file exists with all required front-matter fields present — done; kept Scrum-framework terms untranslated (Sprint, Sprint Planning/Review/Retrospective, Backlog, Increment, Definition of Done, Owner, Researchers, Scrum Team), matching standard Brazilian Scrum practice and the design's guidance on proper nouns; footnote citation left in its original English form

## 3. Upgrading Network and Security Cameras on a Rural Property (on a budget)

- [x] 3.1 Add `translation_key: upgrading-network-and-security-cameras` to `_posts/2024-09-13-upgrading-network-and-security-cameras.md`'s front matter
- [x] 3.2 Create `_posts/pt/2024-09-13-atualizando-rede-e-cameras-de-seguranca.md`: AI-drafted full Portuguese translation, matching front-matter pattern; verify the file exists with all required front-matter fields present — done; product/model names, links, and image URLs kept unchanged; image captions translated

## 4. Improving Home Security using AI

- [x] 4.1 Add `translation_key: improving-home-security-using-ai` to `_posts/2024-09-20-improving-home-security-using-ai copy.md`'s front matter
- [x] 4.2 Create `_posts/pt/2024-09-20-melhorando-a-seguranca-residencial-com-ia.md`: AI-drafted full Portuguese translation (embedded YouTube include, image references, and code blocks left untouched per design.md; image captions/alt text translated), matching front-matter pattern; verify the file exists with all required front-matter fields present — done; diffed both fenced code blocks (docker-compose YAML, Frigate config YAML) against the English original byte-for-byte to confirm they weren't altered; the "line 7/11/15" prose references still point at the same unchanged lines

## 5. SCRUM4Research - Lessons Learned and Tips on Sprint Planning

- [x] 5.1 Add `translation_key: scrum4research-lessons-learned` to `_posts/2024-09-27-scrum4research-lessons-learned.md`'s front matter
- [x] 5.2 Create `_posts/pt/2024-09-27-scrum4research-licoes-aprendidas.md`: AI-drafted full Portuguese translation, matching front-matter pattern; verify the file exists with all required front-matter fields present — done; preserved the `<ins>` emphasis tags and kept Scrum-framework terms (Sprint, Sprint Planning, Sprint Backlog, Sprint Goal, Sprint Review, Definition of Done, Scrum Master, Project Owner) untranslated, matching the other Scrum post's convention

## 6. Cross-check the pairs

- [x] 6.1 For each of the 5 pairs, confirm: the English and Portuguese posts share the same `translation_key`; the Portuguese post's `cover` and any other copied styling front matter matches its English original; no `translation_key` value collides with another pair (all 5 values distinct, and distinct from `local-personal-assistant-hacktown-2026`) — confirmed programmatically: each of the 6 `translation_key` values (5 new + the existing HackTown one) appears exactly twice across all posts; front matter diffed field-by-field per pair (excluding `title`/`key`/`translation_key`/`permalink`) with zero substantive differences

## 7. Owner review

- [x] 7.1 Site owner reviews all 5 drafted translations and edits to their satisfaction (tone, technical accuracy, anything to add/remove) — a real content-authorship step, not a rubber stamp — owner reviewed the drafts and approved proceeding as-is

## 8. Verify via a real build (branch + PR)

- [x] 8.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes — PR #13, `build` passed
- [x] 8.2 Download the built artifact and check: all 5 new `/pt/...` post pages exist and render; each pair now appears only once (as its Portuguese member) in the Portuguese archive/home listing per the existing dedup logic; the English archive/home is unaffected; each pair's giscus embed now computes the same `data-term` — all confirmed; also confirmed the language switcher on two pairs links directly to the counterpart in both directions
- [x] 8.3 Confirm no unrelated pages regressed (diff a sample of untouched pages against a master build) — **found a real regression**: going from 7 total posts to 12 pushed the English home page's classic `jekyll-paginate` (which paginates across *all* posts, both languages, before the `lang == 'en'` filter in `article-list.html` ever runs) past its `paginate: 8` threshold, silently dropping 2 English posts (Scrum for Applied Research, Hello World!) onto an unlinked "page 2". This is the same jekyll-paginate cross-language limitation noted in `add-bilingual-pt-support`'s design.md, previously latent since total post count stayed under 8. Surfaced to the owner; fixed per their direction (see 8.3a/8.3b) and re-verified clean
- [x] 8.3a Immediate fix: override `index.html`'s `articles.data_source` to `site.posts` (same fix already applied to `pt/index.html` for the identical bug), removing English-home pagination entirely so all English posts render on one page regardless of total site post count
- [x] 8.3b Filed a follow-up change proposal, `paginate-posts-by-language`, for the definitive fix (a real per-language pagination scheme for both `/` and `/pt/`) — not implemented in this change; see that proposal for scope
- [x] 8.3c **Found and fixed a follow-on issue from 8.3a**: `home.html`'s layout unconditionally includes `paginator.html` regardless of the per-page `data_source` override, so the pagination widget kept showing a stale, cross-language "6 post articles, 2 pages" stat with a broken page-2 link below the now-complete, unpaginated post list — affecting both `/` and the already-overridden `/pt/` (previously latent there too, since `/pt/`'s own post count hadn't crossed 8 until this change). Fixed by making `_includes/paginator.html` suppress itself entirely when the current page's `articles.data_source` is `site.posts`. Re-verified: both home pages show all 6 English/all-content posts respectively, no dangling pagination widget, and a full diff of `about.html`/`pt/sobre.html`/`404.html`/`archive.html` against a master build showed zero changes; `scrum4research.html` and `pt/arquivo.html` diffs were exactly the expected switcher/prev-next/giscus-term/archive-link updates
- [ ] 8.4 Merge to `master`; confirm the `deploy` job succeeds

## 9. Confirm live

- [ ] 9.1 Load each of the 5 new Portuguese post URLs live and confirm they render correctly
- [ ] 9.2 Confirm the language switcher on each pair now links directly to its counterpart (no longer falling back to `/pt/` or `/`)
- [ ] 9.3 Confirm `openspec validate translate-english-posts-to-portuguese --strict` passes
