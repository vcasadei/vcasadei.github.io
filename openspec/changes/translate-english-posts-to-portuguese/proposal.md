## Why

Five published posts (Hello World!; Scrum for Applied Research; Upgrading Network and Security Cameras on a Rural Property; Improving Home Security using AI; SCRUM4Research - Lessons Learned) currently exist only in English. `add-bilingual-pt-support` gave each a `title_pt` so Portuguese listings show a translated title, but the linked content is still the English article — a Portuguese-only reader clicking through lands on an English page. Translating the full bodies closes that gap using the pairing mechanism (`translation_key`) already built for exactly this purpose.

## What Changes

- Draft full Portuguese translations of the 5 English-only posts' bodies (AI-drafted, flagged for owner review before publishing — same pattern used for the About page and `title_pt` drafts in `add-bilingual-pt-support`).
- Create each translation as a new post under `_posts/pt/`, using the site's existing pairing mechanism: same `translation_key` as its English counterpart (the counterpart posts don't yet have a `translation_key` — this change adds one to each pair), `lang: pt-BR`, and a Portuguese-slug permalink under `/pt/`.
- No change to the English posts' bodies — only their front matter gains a `translation_key` to complete the pairing.
- Once paired, each post's existing behaviors (language-scoped listings, giscus shared-comment mapping, language switcher) apply automatically per the existing `site-internationalization` spec — no new system behavior, only new data populating already-specified mechanisms.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
(none — populating `translation_key`/Portuguese posts uses mechanisms already specified in `site-internationalization`; no requirement changes)

## Impact

- **Affected files**: the 5 English posts (front matter only: add `translation_key`); 5 new files under `_posts/pt/` (full Portuguese translations).
- **Affected systems**: none — no template, config, or CI change. Purely new content plus front-matter additions using existing mechanisms.
- **Content-authorship note**: the initial translations are AI-drafted from the English source text. They are a starting point for owner review (tone, technical-term choices, accuracy), not final authored text — mirroring how `about.md`'s content and the `title_pt` values were handled in prior changes.
