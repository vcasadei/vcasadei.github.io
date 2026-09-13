## Context

Each English-only post already has a `title_pt` (added in `add-bilingual-pt-support`), but no `translation_key` and no Portuguese counterpart post. `add-bilingual-pt-support` already established the pairing/rendering mechanics this change reuses as-is: `_config.yml`'s `defaults:` scope on `path: "_posts/pt"` auto-applies `lang: pt-BR` and permalink pattern `/pt/:year/:month/:day/:title.html` to any post placed there; `_includes/article-list.html`/`tags.html`/`paginator.html` already scope listings and dedupe a `translation_key` pair; `_includes/comments-providers/custom.html` already maps a shared giscus thread by `translation_key`. This change only needs to add the content and the front-matter pairing field — no template changes.

Some posts include non-prose elements (fenced code blocks, an embedded YouTube include, image references with captions) that need a translation policy, not just running the whole file through translation.

## Goals / Non-Goals

**Goals:**
- Produce a Portuguese counterpart for each of the 5 English-only posts, properly paired via `translation_key`.
- Keep translations faithful to the English source's meaning and technical accuracy; flag them clearly as an AI-drafted starting point pending owner review.

**Non-Goals:**
- No changes to the English posts' bodies (only front matter gains `translation_key`).
- No template/config changes — this change is pure content plus front matter, reusing `add-bilingual-pt-support`'s existing mechanisms.
- No re-translation of already-existing Portuguese content (the HackTown post pair is untouched).

## Decisions

**Filename/date**: each Portuguese post file is named with the **same date** as its English original (e.g. `_posts/pt/2024-06-30-ola-mundo.md` for the 2024-06-30 `hello-world` post), not today's authoring date. Rationale: the pair represents one piece of content in two languages: using the original date keeps the pair coherent, threads the translation into the Portuguese archive/home at the chronologically correct spot instead of bunching all 5 backfilled translations at the top under today's date, and matches the precedent set by the HackTown post pair (both dated by the content's actual date, not by whichever language was authored first).

**Filename slug**: translated (e.g. `ola-mundo`, not `hello-world`), matching the precedent set by the existing HackTown post pair (`local-personal-assistant-hacktown-2026` → `assistente-pessoal-local-hacktown-2026`).

**Front matter per new file**: `layout: article` (matching the English original), `title:` set to the post's existing `title_pt` value (no need to re-derive it), `translation_key:` a shared slug added to *both* files in the pair (e.g. `hello-world`, `scrum-for-applied-research`, ...; the same convention already used for the HackTown pair), `key:` the new file's own unique key (`<translation_key>-pt`, matching the `page-about-pt` convention from `pt/about.md`), `cover:` reused as-is (same image asset, no need to duplicate it), and any `mode`/`header`/`article_header` styling fields copied unchanged from the English original so the two versions render identically apart from language. No `permalink:` needed — the `_config.yml` defaults scope already derives it from the file's path/date/slug. Note two of the five originals have a **custom** `permalink:` (`/page/hello-world.html`, `/scrum4research.html`) that does not follow the date-based pattern; the Portuguese counterparts still use the default `_posts/pt` date-based permalink (no matching custom override), since there's no requirement for the two languages' URLs to mirror each other structurally — the switcher and pairing work off `translation_key`, not URL shape.

**Translation scope within each file**: translate prose (paragraphs, headings, list items, image alt text/captions). Leave unchanged: fenced code blocks, shell/config snippets, Liquid includes (e.g. `{%- include extensions/youtube.html id='...' -%}`), raw URLs, and any proper nouns/product names (e.g. *Frigate*, *Scrum*, *SCRUM4Research*) that are also left untranslated in the About page draft already accepted by the owner.

**Adding `translation_key` to the English originals**: a small front-matter-only edit to each of the 5 English posts, done in this change (not a separate one) since a `translation_key` is meaningless without its counterpart exising at the same time — keeps the pairing atomic.

## Risks / Trade-offs

- [AI translation may miss nuance, tone, or get technical terms wrong] → Explicit owner-review task before shipping, same as the About page and `title_pt` drafts.
- [Backdating the Portuguese posts' filenames to 2024 means they don't appear as "new" in a Portuguese-only RSS/feed reader the day this ships] → Accepted: correct chronological placement in the archive is more important than a transient "new post" signal, and the content genuinely is from 2024.
- [Five files is enough that a copy-paste mistake in front matter (wrong `translation_key`, mismatched `cover` path) is plausible] → Task list requires an explicit per-pair verification step (not just "did the file get created").
