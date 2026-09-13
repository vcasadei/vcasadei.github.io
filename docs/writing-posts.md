# Writing a new post

## File location and name

- English post: `_posts/YYYY-MM-DD-slug.md`
- Portuguese post: `_posts/pt/YYYY-MM-DD-slug.md`

The date in the filename is the post's publish date. `_config.yml`'s `defaults:` scope automatically sets `lang: pt-BR` and a `/pt/...` permalink for anything under `_posts/pt/` — you don't need to set those yourself.

## Minimal front matter

```yaml
---
layout: article
title: My Post Title
key: my-post-title
cover: /assets/images/my-post-title.jpeg
---
```

- `layout: article` — every post uses this.
- `title` — the post's title.
- `key` — a unique identifier for the post. Also used as the giscus comment-thread identifier for a post with no `translation_key` (see [architecture.md](architecture.md)).
- `cover` — path to a cover image under `assets/images/`. The build automatically generates a compressed, WebP, and thumbnail version of it (see [post-features.md](post-features.md#images)) — just add the original image and reference it here.

## Other front matter fields in common use

- `title_pt` — a Portuguese translation of the title, shown on Portuguese listings for an English post that has no full Portuguese translation yet.
- `mode: immersive` + `header: { theme: dark }` + `article_header: { type: overlay, theme: dark, background_color: '...', background_image: { gradient: '...', src: /assets/images/... } }` — the theme's full-bleed hero header, used by every post on this site so far. Copy this block from an existing post and swap the image/gradient.
- `show_excerpt: false` — hides the excerpt/summary preview on listing pages (used on longer posts where the excerpt doesn't add much).
- `translation_key` — pairs this post with its translation in the other language (see below).

## Writing the body

Everything after the front matter is Markdown (kramdown). Put `<!--more-->` after your opening hook — everything before it becomes the excerpt shown on listing pages; everything after is only shown on the full post page.

See [post-features.md](post-features.md) for what you can use in the body: math, diagrams, charts, syntax-highlighted code, tables, footnotes, and more.

## Pairing an English post with a Portuguese translation

1. Add `translation_key: some-shared-value` to **both** the English post and its Portuguese counterpart. Any string works, as long as it's the same on both and unique to this pair — the existing convention is to reuse the English post's own slug.
2. Once both posts have the same `translation_key`, they're automatically:
   - Deduplicated on Portuguese listings (only the Portuguese version shows, not both — see [architecture.md](architecture.md)).
   - Linked directly to each other via the language switcher.
   - Given a shared giscus comment thread.

If you haven't written the Portuguese translation yet, just add `title_pt` to the English post — it'll show a translated title on Portuguese listings and link to the English post itself until a real translation exists.
