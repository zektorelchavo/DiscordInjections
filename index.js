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
    let bootstrapPatched = false

    // overwrite (and restore) the .js compiler
    const oldLoader = Module._extensions['.js']
    Module._extensions['.js'] = (mod, filename) => {
      let content = fs.readFileSync(filename, 'utf8')
      const fname = filename.toLowerCase()

      // splash screen patches
      if (fname.endsWith(`app_bootstrap${path.sep}splashscreen.js`)) {
        splashPatched = true

        content = content
          // now add the real patch
          .replace(
            'new _electron.BrowserWindow(windowConfig);',
            `new _electron.BrowserWindow(Object.assign(windowConfig, { webPreferences: { preload: "${path
              .join(preloadPath, 'style.js')
              .replace(/\\/g, '/')}" } }));`
          )

        // main window patches
      } else if (fname.endsWith(`app${path.sep}mainscreen.js`)) {
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
      } else if (fname.endsWith(`app_bootstrap${path.sep}bootstrap.js`)) {
        bootstrapPatched = true
        const flags = JSON.stringify(
          conf.chromeFlags.map(f => (Array.isArray(f) ? f : [f]))
        )

        content = content
          // attach chrome flags
          .replace(
            'app.setVersion',
            `${flags}.forEach(flag => {
            app.commandLine.appendSwitch(flag[0], flag[1]);
          });app.setVersion`
          )
      }

      if (
        splashPatched &&
        mainWindowPatched &&
        updaterPatched &&
        bootstrapPatched
      ) {
        Module._extensions['.js'] = oldLoader
      }

      return mod._compile(content, filename)
    }

    Module._load(path.join(basePath, pkg.main), null, true)
  }
})
