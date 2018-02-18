const { Plugin } = require('elements')
const Promise = require('bluebird')
const postcss = require('postcss')
const postcssImport = require('postcss-import')
const fs = require('fs-extra')
const path = require('path')
const Watcher = module.parent.require('../lib/watcher')

module.exports = class css extends Plugin {
  preload () {
    this.convertLegacySettings()

    this.postcss = postcss([postcssImport])
    this.watcher = new Watcher()
    this.watcher.on('change', (fileName, identifier) =>
      this.onFileChange(identifier, fileName)
    )

    this.cssStack = {}
    this.manager.on('plugins-preloaded', plugins => {
      plugins.map(plugin => this.manager.get(plugin, true)).forEach(plugin => {
        const name = plugin.package.name
        const css = plugin.package.css || []
        if (!css.length) {
          return this.log(name, 'did not specify any css files, skipping')
        } else {
          this.cssStack[name] = {
            path: plugin.path,
            files: css
          }
          return this.log(name, 'requested', css.length, 'css files to attach')
        }
      })
    })

    this.manager.on('load', plugin =>
      this.loadPluginCss(this.manager.get(plugin, true))
    )
    this.manager.on('unload', plugin =>
      this.unloadPluginCss(this.manager.get(plugin, true))
    )
  }

  async load () {
    this.registerSettingsTab('Theme Manager', require('./SettingsPage'))

    await Promise.all(
      Object.keys(this.cssStack).map(async plugin => {
        this.cssStack[plugin].files.forEach(async fileName => {
          const filePath = path.resolve(this.cssStack[plugin].path, fileName)
          let content = await fs.readFile(filePath, 'utf-8')
          content = await this.postcss.process(content, {
            from: filePath,
            to: filePath,
            map: { annotation: false, inline: false, safe: false }
          })
          this.log(`attaching [${plugin}:${fileName}]`)
          document.body.appendChild(
            this._createStyle(content, plugin, fileName)
          )
        })
      })
    )

    return Promise.each(this.getSettingsNode('stylesheets', []), async sheet =>
      this.loadUserCss(sheet.fp)
    )
  }

  unload () {}

  get loadedStylesheets () {
    return this.settings.stylesheets.filter(css => !css.disabled)
  }

  convertLegacySettings () {
    if (this.hasLegacySettings) {
      const legacySettings = this.legacySettings
      if (legacySettings.cssPath) {
        // force overwrite everything!
        const css = legacySettings.cssPath
        this.settings = { stylesheets: [{ raw: true, cssFile: css }] }

        delete legacySettings.cssPath
        this.DI.localStorage.setItem(
          'DI-DiscordInjections',
          JSON.stringify(legacySettings)
        )
      }
    }

    let stylesheets = this.getSettingsNode('stylesheets', [])
    if (!Array.isArray(stylesheets)) {
      this.setSettingsNode(
        'stylesheets',
        Object.keys(stylesheets).map(idx => stylesheets[idx])
      )
    }
  }

  get legacySettings () {
    const dinode = this.DI.localStorage.getItem('DI-DiscordInjections')
    try {
      return JSON.parse(dinode)
    } catch (ex) {
      return {}
    }
  }

  get hasLegacySettings () {
    return this.DI.localStorage.getItem('DI-DiscordInjections') !== null
  }

  _createStyle (content, plugin, filename) {
    const style = document.createElement('style')
    style.dataset.plugin = plugin
    style.dataset.filename = filename
    style.appendChild(document.createTextNode(content))
    return style
  }

  loadPluginCss (plugin) {
    const name = plugin.package.name
    const css = plugin.package.css || []
    if (!css.length) {
      return this.log(name, 'did not specify any css files, skipping')
    } else {
      css.forEach(async fileName => {
        const filePath = path.resolve(plugin.path, fileName)
        let content = await fs.readFile(filePath, 'utf-8')
        content = await this.postcss.process(content, {
          from: filePath,
          to: filePath,
          map: { annotation: false, inline: false, safe: false }
        })
        this.log(`attaching [${plugin.package.name}:${fileName}]`)
        document.body.appendChild(
          this._createStyle(content, plugin.package.name, fileName)
        )
      })
    }
  }

  unloadPluginCss (plugin) {
    Array.from(
      document.querySelectorAll(`style[data-plugin="${plugin.package.name}"]`)
    ).forEach(tag => tag.parentElement.removeChild(tag))
  }

  addUserStyle (filePath, load = true) {
    const resolved = path.resolve(
      this.manager.expand(this.DI.conf.cssPath || './CSS'),
      filePath
    )

    let raw = true
    let pkg = null
    let cssFile = resolved

    try {
      if (fs.statSync(resolved).size > 2) {
        try {
          pkg = require(resolved)
          filePath = path.dirname(filePath)
        } catch (ex) {
          pkg = require(path.join(resolved, 'package.json'))
        }

        raw = false
        cssFile = path.join(path.dirname(resolved), pkg.main)
      }
    } catch (ex) {}

    const idx = raw ? filePath : pkg.name
    const sheets = this.getSettingsNode('stylesheets', [])
    if (sheets.some(sh => sh.fp === idx)) {
      this.warn('user style already registered, ignoring', filePath)
      return
    } else {
      sheets.push({
        raw,
        cssFile,
        base: path.dirname(resolved),
        fp: filePath,
        name: idx
      })
    }
    this.setSettingsNode('stylesheets', sheets)

    if (load) {
      this.loadUserCss(filePath)
    }
  }

  removeUserStyle (filePath, unload = true) {
    if (unload) {
      this.unloadUserCss(filePath, true)
    }

    const sheets = this.getSettingsNode('stylesheets', [])
    this.setSettingsNode(
      'stylesheets',
      sheets.filter(sheet => sheet.fp !== filePath)
    )
  }

  async loadUserCss (filePath, force = false) {
    const meta = this.settings.stylesheets.find(sh => sh.fp === filePath)

    if (!meta.cssFile) {
      return this.error('css file not defined, skipping', filePath)
    }

    let el = document.body.querySelector(
      `style[data-plugin="$userstyle$"][data-filename="${filePath.replace(
        /\\/g,
        '\\\\'
      )}"]`
    )

    if (!el) {
      el = document.body.appendChild(
        this._createStyle('', '$userstyle$', filePath)
      )
      el.removeChild(el.firstChild)
    }

    if (meta.disabled && !force) {
      // dont load disabled themes
      return
    }

    let content = await fs.readFile(meta.cssFile, 'utf-8')
    content = await this.postcss.process(content, {
      from: filePath,
      to: filePath,
      map: { annotation: false, inline: false, safe: false }
    })

    if (el.childNodes.length > 0) {
      this.log(`clearing userstyle [${filePath}]`)
      while (el.firstChild) el.removeChild(el.firstChild)
    } else {
      this.log(`attaching userstyle [${filePath}]`)
      this.watcher.addFile(meta.cssFile, filePath)
    }
    el.appendChild(document.createTextNode(content))
  }

  unloadUserCss (filePath, deleteNode = false) {
    this.log(`detaching userstyle [${filePath}]`)
    const el = document.body.querySelector(
      `style[data-plugin="$userstyle$"][data-filename="${filePath.replace(
        /\\/g,
        '\\\\'
      )}"]`
    )

    const meta = this.settings.stylesheets.find(sh => sh.fp === filePath)
    this.watcher.removeFile(meta.cssFile)
    while (el.firstChild) el.removeChild(el.firstChild)
    if (deleteNode) el.remove()
  }

  moveStylesheet (source, destination) {
    this.console('debug', 'Moving style from', source, 'to', destination)
    const sheets = this.settings.stylesheets
    const sheet = sheets.splice(source, 1)[0]
    sheets.splice(destination, 0, sheet)

    this.setSettingsNode('stylesheets', sheets)

    if (sheet.disabled) {
      return
    }

    const styles = Array.from(
      document.querySelectorAll(`style[data-plugin="$userstyle$"]`)
    )
    const el = styles.splice(source, 1)[0]
    el.remove()

    if (styles.length > destination) {
      styles[destination].parentElement.insertBefore(el, styles[destination])
    } else {
      document.body.appendChild(el)
    }
  }

  setDisabled (index, flag = true) {
    const sheets = this.settings.stylesheets
    sheets[index].disabled = flag

    this.setSettingsNode('stylesheets', sheets)

    if (flag) {
      this.unloadUserCss(sheets[index].fp)
    } else {
      this.loadUserCss(sheets[index].fp)
    }
  }

  async onFileChange (fileName, filePath) {
    this.loadUserCss(fileName)
  }
}
