source "https://rubygems.org"

gem "jekyll", "~> 4.3"

group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-paginate-v2"
  # Classic jekyll-paginate is not used as a plugin (superseded by
  # jekyll-paginate-v2 above), but jekyll-TeXt-theme's own gemspec
  # declares it as a runtime dependency, so it must still be installed
  # for Jekyll::PluginManager#require_theme_deps to succeed. Its own
  # generator stays inert as long as _config.yml has no `paginate:` key.
  gem "jekyll-paginate"
  gem "jekyll-remote-theme"
  gem "jekyll-sitemap"
  gem "jemoji"
end

gem "webrick"
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw]
