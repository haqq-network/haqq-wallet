source 'https://rubygems.org'

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby '3.1.4'

gem 'cocoapods', '~> 1.12.1', '>= 1.12.1'
gem 'fastlane', '~> 2.213.0', '>= 2.213.0'

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
