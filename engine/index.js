const path = require('path')
const fs = require('fs-extra')
const util = require('./util')
const { ipcRenderer } = require('electron')

const conf = fs.existsSync(path.join(__dirname, '..', 'config.json'))
  ? require(path.join(__dirname, '..', 'config.json'))
  : {}

// add jsx compiler support through buble.js
require('./preload/buble').run(conf)

// add console redirect support
require('./preload/console').run(conf)

// stage zero
// load original preload script if there is one
const DI_ORIG_PRELOAD = ipcRenderer.sendSync('di', 'preload')
if (DI_ORIG_PRELOAD) {
  require(DI_ORIG_PRELOAD)
}

// stage one
// post launch patching
process.once('loaded', async () => {
  const ls = window.localStorage
  await util.webpackAvailable()

  const Core = require('./core')
  const DI = new Core(conf, ls)

  // lets boot our plugin manager
  DI.initialize()
})
