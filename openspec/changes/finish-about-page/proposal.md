## Why

`about.md` — the site's About page — currently has no real content; its body is literally the placeholder text "Soon". It's linked from the site header nav on every page, so it's one of the first things a visitor can click into, and right now it's empty.

## What Changes

- Replace the placeholder body of `about.md` with real content, drafted from what's already public about the site owner: the `author` block in `_config.yml` (name, bio "Machine Learning Specialist", LinkedIn/GitHub/Twitter handles), the site's own tagline ("AI, Computer Vision and Accessibility"), and the self-introduction already published in the `hello-world` post (AI/ML Specialist from Brazil, works on AI applied to Accessibility and Software Architecture) and the HackTown 2026 post (recurring public speaker, builds local/independent AI tooling).
- The draft is a starting point for the site owner to review and edit, not a final authored bio — this proposal's task list treats "owner reviews/edits the drafted content" as an explicit step, not an assumption that the first draft ships as-is.
- No layout, front-matter, or navigation changes — `about.md`'s existing front matter (locale titles, `key: page-about`, `comment: false`) is left as-is; only the body content changes.

## Capabilities

### New Capabilities
- `about-page`: The site's About page content — the constraint that it presents real, substantive information about the site/author rather than a placeholder.

### Modified Capabilities
(none)

## Impact

- **Affected files**: `about.md` only.
- **Affected systems**: none — pure content change, no build/config/behavior impact.
- **No impact** to any other page, post, or the CI/CD pipeline.
