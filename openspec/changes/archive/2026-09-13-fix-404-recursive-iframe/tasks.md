## 1. Fix the iframe path

- [x] 1.1 In `_layouts/404.html`, change the game iframe's `src="assets/space-invaders"` to a root-relative path that respects `site.baseurl` (e.g. `{{ site.baseurl }}/assets/space-invaders`), and verify by reading the rendered attribute in a local Jekyll build.

## 2. Verify the fix

- [x] 2.1 Run the site locally (`bundle exec jekyll serve` or equivalent) and load a shallow non-existent URL (e.g. `/foo`); verify the game iframe loads the actual game with no nested 404 content.
- [x] 2.2 Load a deep non-existent URL matching the original bug report's shape (e.g. `/2026/09/11/some-missing-post`); verify the game iframe loads the actual game with no nested/repeated 404 page.
