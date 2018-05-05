const { Plugin } = require('elements')
const Promise = require('bluebird')
const fs = require('fs-extra')
const path = require('path')
const { URL } = require('url')

const glob = require('globby')

module.exports = class plugins extends Plugin {
  async load () {
    this.registerSettingsTab('Plugin Manager', require('./SettingsPage'))

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

  disable (index, flag) {
    const key = Array.from(this.plugins.keys())[index]

    if (flag) {
      return this.DI.plugins.disable(this.plugins.get(key).package.name, true)
    } else {
      return this.DI.plugins.enable(this.plugins.get(key).package.name, true)
    }
  }

  delete (index) {
    const plugin = Array.from(this.plugins.values())[index]

    return this.DI.plugins.uninstall(plugin.inst._name)
  }

  getPluginID (pkg) {
    if (!pkg.repository) {
      return pkg.name
    }

    if (pkg.repository.url) {
      // only git supported
      if (pkg.repository.type && pkg.repository.type !== 'git') {
        return pkg.name
      }

      const url = new URL(pkg.repository.url)
      return path.join(url.hostname, url.pathname.replace(/\.git$/, '')) // remove protocol part and (optional) .git extension
    } else if (pkg.repository.startsWith('github:')) {
      // special case github: prefix
      return path.join('github.com', pkg.repository.substr(7))
    } else if (pkg.repository.startsWith('gitlab:')) {
      // special case gitlab: prefix
      return path.join('gitlab.com', pkg.repository.substr(7))
    } else if (pkg.repository.startsWith('bitbucket:')) {
      // special case bitbucket: prefix
      return path.join('bitbucket.org', pkg.repository.substr(10))
    } else if (pkg.repository.startsWith('gist:')) {
      // github gists not supported
      return pkg.name
    } else if (!pkg.repository.contains(':')) {
      // special case prefix and scheme less (github)
      return path.join('github.com', pkg.repository)
    } else {
      // regular url
      const url = new URL(pkg.repository)
      return path.join(url.hostname, url.pathname.replace(/\.git$/, '')) // remove protocol part and (optional) .git extension
    }
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

  isSystemPlugin (id) {
    return fs.existsSync(path.join(__dirname, '..', id, 'package.json'))
  }

  isPluginEnabled (id) {
    if (this.isSystemPlugin(id)) {
      return true
    }

    return !!this.settings.plugins[id].enabled
  }
}
