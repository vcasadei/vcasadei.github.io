## 1. Verify the mechanism works

- [x] 1.1 Temporarily add `comment: false` to an existing post's front matter in a local build and verify the giscus comment section does not render on that post.
- [x] 1.2 Verify a different post without the flag still renders its giscus comment section, confirming the toggle is per-post and not global.
- [x] 1.3 Revert the temporary front-matter change used for verification.

## 2. Document the feature

- [x] 2.1 Add a section to `docs/writing-posts.md` describing `comment: false` front matter as the way to disable comments on a specific post, noting comments are ON by default.
- [x] 2.2 Add a mention in `docs/post-features.md` listing per-post comment toggling as a supported post feature.
