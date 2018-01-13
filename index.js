const path = require('path')
const Module = require('module')
const fs = require('fs')
const electron = require('electron')

const conf = fs.existsSync(path.join(__dirname, 'config.json'))
  ? require(path.join(__dirname, 'config.json'))
  : {}
const preloadPath = path.join(__dirname, 'engine')

Object.assign(exports, {
  inject (appPath) {
    const basePath = path.join(appPath, '..', 'app.asar')

    // fetch discord package.json
    const pkg = require(path.join(basePath, 'package.json'))

    // adjust electron root
    electron.app.getAppPath = () => basePath

    let splashPatched = false
    let mainWindowPatched = false
    let updaterPatched = false

    // overwrite (and restore) the .js compiler
    const oldLoader = Module._extensions['.js']
    Module._extensions['.js'] = (mod, filename) => {
      let content = fs.readFileSync(filename, 'utf8')
      const fname = filename.toLowerCase()

      // splash screen patches
      if (
        fname.endsWith(`app_bootstrap${path.sep}splashscreen.js`) ||
        fname.endsWith('splashwindow.js')
      ) {
        splashPatched = true

        content = content
          // alias old var name
          .replace(
            'this._window = new _electron.BrowserWindow(windowConfig);',
            'const splashWindow = this._window = new _electron.BrowserWindow(windowConfig);'
          )
          // now add the real patch
          .replace(
            'new _electron.BrowserWindow(windowConfig);',
          `new _electron.BrowserWindow(Object.assign(windowConfig, { webPreferences: { preload: "${path
            .join(preloadPath, 'style.js')
            .replace(/\\/g, '/')}" } }));`
          )

        // main window patches
      } else if (
        fname.endsWith(`app${path.sep}mainscreen.js`) ||
        fname.endsWith(`app.asar${path.sep}index.js`)
      ) {
        mainWindowPatched = true

        content = content
          // preload our script
          .replace(
            'webPreferences: {',
            `webPreferences: { preload: "${path
              .join(preloadPath, 'index.js')
              .replace(/\\/g, '/')}",`
          )
          // transparency
          .replace('transparent: false', `transparent: ${conf.transparent}`)
        if (conf.transparent) {
            content = content.replace('backgroundColor: ACCOUNT_GREY,', '')
        }

        if (typeof conf.frame === typeof true) {
          // native frame
          content = content
            .replace('frame: false,', `frame: ${conf.frame},`)
            .replace(
              'mainWindowOptions.frame = true;',
              `mainWindowOptions.frame = ${conf.frame};`
            )
        }
      }

      if (splashPatched && mainWindowPatched && updaterPatched) {
        Module._extensions['.js'] = oldLoader
      }

      return mod._compile(content, filename)
    }

    Module._load(path.join(basePath, pkg.main), null, true)
  }
})
