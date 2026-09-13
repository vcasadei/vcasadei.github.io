# Dependencies

## Ruby and Jekyll

CI pins **Ruby 3.3** (`.github/workflows/deploy.yml`, `ruby/setup-ruby`) and installs gems from the committed `Gemfile.lock` (`bundler-cache: true`). This repo does **not** use the `github-pages` gem — see [architecture.md](architecture.md) for why building it ourselves matters.

## Gems (`Gemfile`)

| Gem | Why it's here |
|---|---|
| `jekyll` (`~> 4.3`) | The static site generator itself. |
| `jekyll-feed` | Generates `feed.xml` (Atom feed). |
| `jekyll-paginate-v2` | Powers per-language home page pagination (English by `locale`, Portuguese by a computed `pt-listing` category) — see [architecture.md](architecture.md). |
| `jekyll-paginate` | **Not used as a plugin** (not listed in `_config.yml`'s `plugins:`). `jekyll-TeXt-theme`'s own gemspec declares it as a runtime dependency, so `require "jekyll-paginate"` must succeed or the theme fails to load. Its generator stays inert as long as `_config.yml` has no legacy `paginate:` key. |
| `jekyll-remote-theme` | Fetches `jekyll-TeXt-theme` at build time instead of vendoring it into this repo. |
| `jekyll-sitemap` | Generates `sitemap.xml`. |
| `jemoji` | Renders `:emoji:` shortcodes in Markdown. |
| `webrick` | HTTP server for `jekyll serve` locally (not needed for `jekyll build` in CI, but useful for local development on Ruby 3+, which dropped webrick from the standard library). |
| `tzinfo-data` | Timezone database, only pulled in on Windows platforms where the OS doesn't provide one. |

## OS-level tools (build step, not a gem)

The workflow's "Optimize images" step installs two Ubuntu packages before the Jekyll build runs:

- **`imagemagick`** (`convert`) — recompresses/resizes images and generates thumbnails.
- **`webp`** (`cwebp`) — encodes the `.webp` sibling for every image.

## Local development

Running `bundle install` and `bundle exec jekyll build`/`serve` locally works the same way CI does, as long as your local Ruby can install the gems in `Gemfile.lock` (Ruby 3.3+ is recommended; very new or very old Ruby versions may hit native-extension build issues with some transitive dependencies).
