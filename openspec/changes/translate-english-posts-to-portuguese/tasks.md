## 1. Hello World!

- [ ] 1.1 Add `translation_key: hello-world` to `_posts/2024-06-30-hello-world.md`'s front matter
- [ ] 1.2 Create `_posts/pt/2024-06-30-ola-mundo.md`: AI-drafted full Portuguese translation of the body, front matter per design.md (`title: Olá, Mundo!`, `lang` via defaults, `translation_key: hello-world`, `key: hello-world-pt`, `cover` copied unchanged); verify the file exists with all required front-matter fields present

## 2. Scrum for Applied Research

- [ ] 2.1 Add `translation_key: scrum-for-applied-research` to `_posts/2024-07-31-scrum4research.md`'s front matter
- [ ] 2.2 Create `_posts/pt/2024-07-31-scrum-para-pesquisa-aplicada.md`: AI-drafted full Portuguese translation (code blocks/technical terms left untranslated per design.md), matching front-matter pattern; verify the file exists with all required front-matter fields present

## 3. Upgrading Network and Security Cameras on a Rural Property (on a budget)

- [ ] 3.1 Add `translation_key: upgrading-network-and-security-cameras` to `_posts/2024-09-13-upgrading-network-and-security-cameras.md`'s front matter
- [ ] 3.2 Create `_posts/pt/2024-09-13-atualizando-rede-e-cameras-de-seguranca.md`: AI-drafted full Portuguese translation, matching front-matter pattern; verify the file exists with all required front-matter fields present

## 4. Improving Home Security using AI

- [ ] 4.1 Add `translation_key: improving-home-security-using-ai` to `_posts/2024-09-20-improving-home-security-using-ai copy.md`'s front matter
- [ ] 4.2 Create `_posts/pt/2024-09-20-melhorando-a-seguranca-residencial-com-ia.md`: AI-drafted full Portuguese translation (embedded YouTube include, image references, and code blocks left untouched per design.md; image captions/alt text translated), matching front-matter pattern; verify the file exists with all required front-matter fields present

## 5. SCRUM4Research - Lessons Learned and Tips on Sprint Planning

- [ ] 5.1 Add `translation_key: scrum4research-lessons-learned` to `_posts/2024-09-27-scrum4research-lessons-learned.md`'s front matter
- [ ] 5.2 Create `_posts/pt/2024-09-27-scrum4research-licoes-aprendidas.md`: AI-drafted full Portuguese translation, matching front-matter pattern; verify the file exists with all required front-matter fields present

## 6. Cross-check the pairs

- [ ] 6.1 For each of the 5 pairs, confirm: the English and Portuguese posts share the same `translation_key`; the Portuguese post's `cover` and any other copied styling front matter matches its English original; no `translation_key` value collides with another pair (all 5 values distinct, and distinct from `local-personal-assistant-hacktown-2026`)

## 7. Owner review

- [ ] 7.1 Site owner reviews all 5 drafted translations and edits to their satisfaction (tone, technical accuracy, anything to add/remove) — a real content-authorship step, not a rubber stamp

## 8. Verify via a real build (branch + PR)

- [ ] 8.1 Push to a branch and open a PR; confirm the `build` GitHub Actions check passes
- [ ] 8.2 Download the built artifact and check: all 5 new `/pt/...` post pages exist and render; each pair now appears only once (as its Portuguese member) in the Portuguese archive/home listing per the existing dedup logic; the English archive/home is unaffected; each pair's giscus embed now computes the same `data-term`
- [ ] 8.3 Confirm no unrelated pages regressed (diff a sample of untouched pages against a master build)
- [ ] 8.4 Merge to `master`; confirm the `deploy` job succeeds

## 9. Confirm live

- [ ] 9.1 Load each of the 5 new Portuguese post URLs live and confirm they render correctly
- [ ] 9.2 Confirm the language switcher on each pair now links directly to its counterpart (no longer falling back to `/pt/` or `/`)
- [ ] 9.3 Confirm `openspec validate translate-english-posts-to-portuguese --strict` passes
