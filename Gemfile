source 'https://rubygems.org'

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby '3.2.0'

# Cocoapods 1.15 introduced a bug which break the build. We will remove the upper
# bound in the template on Cocoapods with next React Native release.
gem 'cocoapods', '~> 1.13'
gem 'activesupport', '>= 6.1.7.5', '< 7.1.0'
gem 'fastlane', '2.227.0'

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
