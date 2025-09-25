# frozen_string_literal: true

source 'https://rubygems.org'

# Use plain Jekyll locally so non-whitelisted plugins (e.g. jekyll-archives)
# actually load. GitHub Pages builds will still ignore such plugins unless you
# prebuild via Actions and deploy the generated site.
gem 'jekyll', '~> 4.3'

group :jekyll_plugins do
  gem 'jekyll-archives', '~> 2.3'
  gem 'jekyll-remote-theme'
  gem 'jekyll-feed'
  gem 'jekyll-paginate'
  gem 'jemoji'
  gem 'jekyll-commonmark'
end

group :development do
  gem 'webrick'   # needed to run a server locally
  gem 'rubocop'
end
