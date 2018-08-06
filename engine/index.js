const path = require('path')
const fs = require('fs-extra')

const postcss = require('postcss')
const postcssImport = require('postcss-import')
const postcssUrl = require('postcss-url')

const conf = fs.existsSync(path.join(__dirname, '..', 'config.json'))
  ? require(path.join(__dirname, '..', 'config.json'))
  : {}

// add jsx compiler support through buble.js
require('./preload/buble').run(conf)

// add console redirect support
require('./preload/console').run(conf)

// stage zero
// load original preload script if there is one
if (process.env.DI_ORIG_PRELOAD) {
  require(process.env.DI_ORIG_PRELOAD)
}

// stage one
// prelaunch adjustments
const DI = {
  get conf () {
    return conf
  },

  get package () {
    return require('../package.json')
  },

  get version () {
    return this.package.version
  },

  get contributors () {
    if (!this._contributors) {
      Object.defineProperty(this, '_contributors', {})
      this._contributors = {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      }

      fs
        .readFileSync(path.join(__dirname, '..', 'CONTRIBUTORS.md'), 'utf-8')
        .split('\n')
        .filter(line => line.startsWith('*'))
        .map(line => line.match(/\*\*(.+)\*\* <!-- (\d+) -->/))
        .forEach(([_, name, id]) => (this._contributors[id] = name))
    }

    return this._contributors
  },

  postcss: postcss([
    postcssImport(),
    postcssUrl({
      url: 'inline'
    })
  ])
}

Object.defineProperty(DI, 'localStorage', {
  writable: false,
  value: window.localStorage
})

Object.defineProperty(DI, 'sessionStorage', {
  writable: false,
  value: window.sessionStorage
})

Object.defineProperty(DI, 'pluginManager', {
  writable: false,
  value: new (require('./pluginManager'))(DI)
})

// stage two
// post launch patching
process.once('loaded', async () => {
  // lets boot our plugin manager
  DI.pluginManager.initialize()
})
