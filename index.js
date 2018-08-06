// injector script based on https://github.com/joe27g/EnhancedDiscord/blob/beta/advanced_installation.md

const path = require('path')
const fs = require('fs-extra')
const Module = require('module')
const electron = require('electron')
const { BrowserWindow } = electron

const conf = fs.existsSync(path.join(__dirname, 'config.json'))
  ? require(path.join(__dirname, 'config.json'))
  : {}
const preloadPath = path.join(__dirname, 'engine')

process.env.DI_DEBUG_LOG = path.join(__dirname, 'debug.log')
fs.removeSync(process.env.DI_DEBUG_LOG)

// patch browser window to use custom options
class PatchedBrowserWindow extends BrowserWindow {
  constructor (originalOptions) {
    const options = Object.assign({}, originalOptions)
    options.webPreferences = options.webPreferences || {}

    // options.center is only defined in the splash screen
    if (!options.center) {
      // add transparency support
      if (conf.frame === true) {
        options.frame = true
      } else if (conf.frame === false) {
        if (conf.transparency === true) {
          options.transparent = true
          delete options.backgroundColor
        } else if (conf.transparency === false) {
          options.transparent = false
        }
      }
    }

    process.env.DI_ORIG_PRELOAD = options.webPreferences.preload
    options.webPreferences.preload = path.join(preloadPath, 'index.js')

    return new BrowserWindow(options)
  }
}

const cacheEntry = Object.keys(require.cache)
  .filter(k => k.match(/browser-window\.js$/i))
  .pop()

require.cache[cacheEntry].exports = PatchedBrowserWindow

electron.app.on('ready', () => {
  // patch webRequest session to ditch the CSP headers
  electron.session.defaultSession.webRequest.onHeadersReceived(
    (details, done) => {
      // delete the content security response headers
      Object.keys(details.responseHeaders)
        .filter(k => k.toLowerCase() === 'content-security-policy')
        .forEach(k => delete details.responseHeaders[k])

      done(Object.assign(details, { cancel: false }))
    }
  )

  // patch webRequest session to not ask for source map files
  electron.session.defaultSession.webRequest.onBeforeRequest((details, done) =>
    done({ cancel: details.url.endsWith('.js.map') })
  )
})

// patch command line options
if (conf.chromeFlags && Array.isArray(conf.chromeFlags)) {
  conf.chromeFlags.forEach(flag => {
    const key = Array.isArray(flag) ? flag[0] : flag
    const value = Array.isArray(flag) ? flag[1] : null
    electron.app.commandLine.appendSwitch(key, value)
  })
}

exports.inject = function inject (appPath) {
  const basePath = path.join(appPath, '..', 'app.asar')

  // fetch discord package.json
  const pkg = require(path.join(basePath, 'package.json'))

  // adjust electron root
  electron.app.getAppPath = () => basePath

  /*
  let updaterPatched = false

  // overwrite (and restore) the .js compiler
  const oldLoader = Module._extensions['.js']
  Module._extensions['.js'] = (mod, filename) => {
    let content = fs.readFileSync(filename, 'utf8')
    // const fname = filename.toLowerCase()

    if (updaterPatched) {
      Module._extensions['.js'] = oldLoader
    }

    return mod._compile(content, filename)
  }
  */

  // daisy chain into the original application file
  Module._load(path.join(basePath, pkg.main), null, true)
}
