const { Plugin } = require('elements')
const Promise = require('bluebird')
const fs = require('fs-extra')
const path = require('path')
const glob = require('globby')

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
      'Plugin Manager',
      require('./SettingsPluginPage'),
      'DI-plugins-plugin'
    )

    this.registerSettingsTab(
      'Theme Manager',
      require('./SettingsThemePage'),
      'DI-plugins-themes'
    )

    this.registerCommand({
      name: 'reset',
      info:
        'Clears the whole local storage from Discord Injections and reloads Discord',
      func: this.resetLocalStorage.bind(this)
    })
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

  addPlugin (path) {
    this.DI.plugins.install(path)
  }

  async install (pkgName, pkgDownload, force = false) {
    try {
      const installPath = path.join(this.manager.basePath, pkgName)
      const dlPath = path.join(this.manager.basePath, '_' + pkgName)
      this.debug('Downloading', pkgName, 'to', dlPath)
      await download(pkgDownload, dlPath, { extract: true })
      await fs.move(path.join(dlPath, 'package'), installPath)
      await fs.remove(dlPath)

      this.debug('Installing deps for', pkgName)
      await npmi({
        name: installPath,
        path: installPath,
        forceInstall: false,
        localInstall: false,
        // dont create npm log entries pls
        npmLoad: {
          loglevel: 'silent'
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
    console.warn('MANUAL PATH THINGY!')
  }

  getPluginInfo (id) {
    if (!this.settings.plugins) {
      const s = this.settings
      s.plugins = s.plugins || {}
      this.settings = s
    }

    if (!this.settings.plugins[id]) {
      const s = this.settings
      s.plugins[id] = {}
      this.settings = s
    }

    return this.settings.plugins[id]
  }

  setPluginInfo (id, key, value) {
    const p = this.getPluginInfo(id)
    p[key] = value
    this.setSettingsNode(`plugins.${id}`, p)
  }

  isSystemPlugin (id) {
    return fs.existsSync(path.join(__dirname, '..', id, 'package.json'))
  }

  isPluginEnabled (id) {
    if (this.isSystemPlugin(id)) {
      return true
    }

    return !this.getPluginInfo(id).disabled
  }

  removeLocal (id) {
    this.setPluginInfo(id, 'path', null)
  }
}
