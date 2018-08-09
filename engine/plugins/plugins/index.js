const { Plugin } = require('elements')
const Promise = require('bluebird')
const fs = require('fs-extra')
const path = require('path')
const glob = require('globby')
const fetch = require('node-fetch')
const { clipboard, dialog, getCurrentWindow } = require('electron').remote

// make `npmi` happy
const npmPath = require.resolve('npm')
process.env.GLOBAL_NPM_BIN = 'idc'
process.env.GLOBAL_NPM_PATH = npmPath
const npmi = Promise.promisify(require('npmi'))

const download = require('download')

module.exports = class plugins extends Plugin {
  async load () {
    this.registerSettingsTab(
      'Customize DI',
      require('./SettingsRepositoryPage'),
      'DI-plugins-repo'
    )

    this.registerSettingsTab(
      'Plugins & Themes',
      require('./SettingsPluginPage'),
      'DI-plugins-plugin'
    )

    this.registerCommand({
      name: 'reset',
      info:
        'Clears the whole local storage from Discord Injections and reloads Discord',
      func: this.resetLocalStorage.bind(this)
    })

    this.registerCommand({
      name: 'debug',
      info: 'Toggle debug mode and reload discord',
      func: this.toggleDebugMode.bind(this)
    })

    if (this.debugEnabled) {
      this.registerCommand({
        name: 'upload',
        info: 'Upload the current log file',
        func: this.uploadLog.bind(this)
      })
    }
  }

  get iconURL () {
    return '//discordinjections.xyz/img/logo.png'
  }

  resetLocalStorage () {
    const ls = this.DI.localStorage

    for (let idx = 0; idx < ls.length; idx++) {
      const key = ls.key(idx)
      if (key.startsWith('DI-')) {
        ls.removeItem(key)
      }
    }

    window.location.reload()
  }

  unload () {}

  async addPlugin (installPath, skipInstall = false) {
    if (await this.install(installPath)) {
      const pkgName = require(path.join(installPath, 'package.json')).name
      this.setPluginInfo(pkgName, 'path', installPath)
    }
  }

  async addTheme (installPath) {
    const pkgName = path.basename(installPath)
    await this.manager.loadByPath(installPath)
    this.setPluginInfo(pkgName, 'path', installPath)
  }

  async install (pkgName, pkgDownload = null, force = false, update = false) {
    try {
      let installPath = pkgName

      if (pkgDownload) {
        installPath = path.join(this.manager.basePath, pkgName)
        if (update) {
          // remove old plugin folder, if doing an update
          await this.manager.unload('DI#' + pkgName)
          await fs.remove(installPath)
        }
        const dlPath = path.join(this.manager.basePath, '_' + pkgName)
        this.debug('Downloading', pkgName, 'to', dlPath)
        await download(pkgDownload, dlPath, { extract: true })
        await fs.move(path.join(dlPath, 'package'), installPath)
        await fs.remove(dlPath)
      } else {
        pkgName = require(path.join(installPath, 'package.json')).name
      }

      this.debug('Installing deps for', pkgName, 'in', installPath)
      await npmi({
        path: installPath,
        forceInstall: false,
        localInstall: false,
        // dont create npm log entries pls
        npmLoad: {
          loglevel: this.debugEnabled ? 'silly' : 'silent'
        }
      })

      this.manager.loadByPath(installPath, force)
      return true
    } catch (err) {
      this.error('failed to install packages', err)
      return false
    }
  }

  disable (id, flag = true) {
    // first fetch the raw plugin
    if (!this.manager.plugins.has(id)) {
      // no worries about non existant plugins
      return
    }
    this.setPluginInfo(id, 'disabled', flag)
    const p = this.manager.plugins.get(id)

    if (flag && p.loaded) {
      // unload disabled plugins
      return this.manager.unload(id)
    } else if (!flag && !p.loaded) {
      return this.manager.loadFromCache(p.id, true)
    }
  }

  delete (id) {
    if (!this.manager.plugins.has(id)) {
      return
    }

    return this.manager.uninstall(id)
  }

  async loadPlugins () {
    // first load all system plugins
    const systemPlugins = await glob('**/package.json', {
      cwd: path.dirname(__dirname),
      absolute: true
    })

    await Promise.each(systemPlugins, pkg => this.manager.loadByPath(pkg, true))

    // now check the plugin path
    this.manager.loadPluginPath()

    // last, but not least, load the missing plugins
    if (!this.settings.plugins) {
      return
    }

    return Object.keys(this.settings.plugins)
      .map(k => this.settings.plugins[k])
      .filter(p => p.path)
      .forEach(p => this.manager.loadByPath(p.path, false))
  }

  getPluginInfo (id) {
    if (!this.settings.plugins) {
      const s = this.settings
      s.plugins = s.plugins || {}
      this.settings = s
    }

    id = id.replace(/\./g, '_')

    if (!this.settings.plugins[id]) {
      const s = this.settings
      s.plugins[id] = {}
      this.settings = s
    }

    return this.settings.plugins[id]
  }

  setPluginInfo (id, key, value) {
    id = id.replace(/\./g, '_')
    const p = this.getPluginInfo(id)
    p[key] = value
    this.setSettingsNode(`plugins.${id}`, p)
  }

  removeLocal (id) {
    this.setPluginInfo(id, 'path', null)
  }

  async toggleDebugMode () {
    const fname = path.join(__dirname, '..', '..', '..', 'config.json')
    const config = Object.assign({}, this.DI.conf, {
      debug: !this.DI.conf.debug
    })
    const json = JSON.stringify(config, '', 2)
    await fs.writeFile(fname, json, 'utf8')
    window.location.reload()
  }

  async uploadLog () {
    const fname = path.join(__dirname, '..', '..', '..', 'console.log')
    if (!await fs.pathExists(fname)) {
      // do nothing without a log. maybe show a message?
      return
    }

    const res = await fetch('https://hastebin.com/documents', {
      method: 'POST',
      body: await fs.readFile(fname, 'utf8')
    })
    const { key } = await res.json()
    clipboard.writeText(`https://hastebin.com/raw/${key}.log`)

    dialog.showMessageBox(getCurrentWindow(), {
      type: 'info',
      title: 'Log Upload',
      message: `Your log has been successfully uploaded and the URL is in the clipboard`
    })
  }
}
