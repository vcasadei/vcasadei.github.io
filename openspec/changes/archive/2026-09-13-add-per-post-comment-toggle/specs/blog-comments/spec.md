## ADDED Requirements

### Requirement: Individual posts can opt out of comments
Blog posts SHALL support comments by default. A post author SHALL be able to disable comments for one specific post via a documented front-matter key, without affecting any other post.

#### Scenario: Post with no override shows comments
- **WHEN** a reader opens a published post that does not set the comment front-matter key
- **THEN** the giscus comment widget loads for that post

#### Scenario: Post explicitly disables comments
- **WHEN** a post's front matter sets `comment: false`
- **THEN** no comment widget or section renders on that post, while other posts are unaffected

#### Scenario: Documented for authors
- **WHEN** an author consults the site's post-authoring documentation
- **THEN** the documentation describes the `comment: false` front-matter key as the supported way to disable comments on a single post
