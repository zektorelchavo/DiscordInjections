const { Plugin } = require('elements')

module.exports = class Theme extends Plugin {
  get watchCSSbyDefault () {
    return true
  }
}
