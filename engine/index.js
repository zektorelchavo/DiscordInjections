const { getCurrentWebContents, app } = require('electron').remote
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

// stage zero
// load original preload script if there is one
try {
  const appData = app.getPath('appData')
  const dist = Object.keys(process.versions)
    .find(k => k.includes('iscord'))
    .toLowerCase()
  const version = fs
    .readdirSync(path.join(appData, dist))
    .filter(d => d.match(/\d+\.\d+\.\d+/))
    .pop()

  require(path.join(
    appData,
    dist,
    version,
    'modules',
    'discord_desktop_core',
    'core.asar',
    'app',
    'mainScreenPreload.js'
  ))
} catch (err) {
  // ignore if not existant
  console.error(err)
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
  global.process = process
  global.require = require

  const ready = new Promise(resolve =>
    getCurrentWebContents().on('dom-ready', resolve)
  )

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
