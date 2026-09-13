## 1. Scope comments to posts only

- [x] 1.1 Add `comment: false` to the front matter of `about.md` and verify (local build) that the About page renders no comment section.
- [x] 1.2 Add `comment: false` to the front matter of `archive.html` and verify (local build) that the Archive page renders no comment section.
- [x] 1.3 Add `comment: false` to the front matter of `index.html` and verify (local build) that the Home page renders no comment section.
- [x] 1.4 Add `comment: false` to the front matter of `_layouts/404.html` and verify (local build) that the 404 page renders no comment section.
- [x] 1.5 Verify (local build) that a blog post still renders its giscus comment section unchanged.

## 2. Update documentation

- [x] 2.1 Update `docs/architecture.md`'s Comments bullet to note that comments render on blog posts only (Home, Archive, About, and 404 pages opt out via `comment: false`).
