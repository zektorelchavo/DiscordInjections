const { getCurrentWindow, getCurrentWebContents } = require('electron').remote
const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const buble = require('buble')

// register custom extension compilation support
require.extensions['.jsx'] = (module, filename) => {
  const raw = fs.readFileSync(filename, 'utf8')
  const transformed = buble.transform(raw, {
    jsx: 'React.createElement',
    objectAssign: 'Object.assign',
    target: { chrome: 52 }
  })
  return module._compile(transformed.code, filename)
}

// stage one
// prelaunch adjustments
const DI = {
  get conf () {
    const conf = fs.existsSync(path.join(__dirname, '..', 'config.json'))
      ? require(path.join(__dirname, '..', 'config.json'))
      : {}
    return conf
  },

  get package () {
    return require('../package.json')
  },

  get version () {
    return this.package.version
  }
}

Object.defineProperty(DI, 'localStorage', {
  writable: false,
  value: require('./localStorage')
})

Object.defineProperty(DI, 'plugins', {
  writable: false,
  value: new (require('./pluginManager'))(DI)
})

// stage two
// post launch patching
process.once('loaded', async () => {
  const ready = new Promise(rs => getCurrentWebContents().on('dom-ready', rs))
  Object.defineProperty(window, 'DI', {
    enumerable: false,
    set () {},
    get () {
      return DI
      throw new Error('Erm nope, this thing wont do shit anymore')
    }
  })

  // add core modules
  await DI.plugins.loadByPath(
    path.join(__dirname, 'plugins', 'react'),
    true,
    true
  )
  await DI.plugins.loadByPath(
    path.join(__dirname, 'plugins', 'settings'),
    true,
    true
  )
  await DI.plugins.loadByPath(
    path.join(__dirname, 'plugins', 'plugins'),
    true,
    true
  )
  await DI.plugins.loadByPath(
    path.join(__dirname, 'plugins', 'commands'),
    true,
    true
  )
  await DI.plugins.loadByPath(path.join(__dirname, 'plugins', 'changelog'))
  DI.plugins.get('changelog', true).core = true

  await DI.plugins.loadByPath(
    path.join(__dirname, 'plugins', 'css'),
    true,
    true
  )

  // add external modules
  await DI.plugins.loadPluginPath()

  ready.then(() => DI.plugins.ready())
})
