const { Plugin } = require('elements')
const Promise = require('bluebird')
const postcss = require('postcss')
const postcssImport = require('postcss-import')
const fs = require('fs-extra')
const path = require('path')
const Watcher = module.parent.require('../lib/watcher')

const glob = require('globby')

module.exports = class plugins extends Plugin {
  async load () {
    this.registerSettingsTab('Plugin Manager', require('./SettingsPage'))
  }

  get iconURL () {
    return '//discordinjections.xyz/img/logo.png'
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

  getPluginID (path, pkg) {
    // TODO more sophisticated package id generator
    // base it on the package path (which will be the repo)
    // .../plugins/github.com/cking/emoji-menu => github.com/cking/emoji-menu
    // use package.name only as a fallback (for example for dev modules and custom paths)

    return pkg.name
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

    /*
    const globalRoot = this.manager.basePath

    // now load every global plugin
    const plugins = await glob('** /package.json', globalRoot)
    console.log(this) */
  }

  isSystemPlugin (id) {
    return fs.existsSync(path.join(__dirname, '..', id, 'package.json'))
  }
}
