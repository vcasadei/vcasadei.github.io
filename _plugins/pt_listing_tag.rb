module Jekyll
  # Tags every post that belongs in the Portuguese listing with a synthetic
  # "pt-listing" category, so jekyll-paginate-v2 can paginate the Portuguese
  # home page by that category. Mirrors the dedup/fallback rule that
  # _includes/article-list.html already applies in Liquid for other listings
  # (archive, tag search): a Portuguese post always belongs; an English post
  # belongs only if no Portuguese post shares its translation_key. Keep this
  # in sync with that Liquid logic if either one changes.
  class PtListingTag < Jekyll::Generator
    priority :high

    def generate(site)
      posts = site.posts.docs

      paired_translation_keys = posts
        .select { |post| (post.data["lang"] || "en") != "en" }
        .map { |post| post.data["translation_key"] }
        .compact

      posts.each do |post|
        next unless belongs_in_pt_listing?(post, paired_translation_keys)

        categories = Array(post.data["categories"])
        post.data["categories"] = (categories + ["pt-listing"]).uniq
      end
    end

    private

    def belongs_in_pt_listing?(post, paired_translation_keys)
      lang = post.data["lang"] || "en"
      return true if lang != "en"

      translation_key = post.data["translation_key"]
      translation_key.nil? || !paired_translation_keys.include?(translation_key)
    end
  end
end
