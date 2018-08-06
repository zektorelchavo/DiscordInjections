# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
### Changed
- New, backwards compatible injector script, that should be way better
### Deprecated
### Removed
### Fixed
### Security

## [4.0.1] - 2018-08-01

### Fixed
- Not sure if you could call it "fixed", but removed the CSP header to allow loading external sources again

## 4.0.0 - 2018-06-02
This is a completly new release with a new base.
It allows loading of Plugins and Themes and more.

### Changed
- Removed the internal webserver, things should resolve thanks to PostCSS magic
- More advanced plugin system plus, full dependency management, repo browser and more
- CSS for splash screens
- Multiple stylesheets and more. Care, could break things horribly if done wrong

[Unreleased]: https://github.com/DiscordInjections/compare/v4.0.1...HEAD
[4.0.1]: https://github.com/DiscordInjections/compare/v4.0.1...v4.0.0
