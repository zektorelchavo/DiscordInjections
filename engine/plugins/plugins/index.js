const Plugin = module.parent.require('../components/plugin')
const Promise = require('bluebird')
const postcss = require('postcss')
const postcssImport = require('postcss-import')
const fs = require('fs-extra')
const path = require('path')
const Watcher = module.parent.require('../lib/watcher')

module.exports = class plugins extends Plugin {
  preload () {
    this.plugins = new Map()

    this.manager.on('plugins-preloaded', plugins =>
      plugins.map(pluginName => {
        const plugin = this.DI.plugins.get(pluginName, true)
        this.plugins.set(plugin.path, plugin)
      })
    )

    this.manager.on('load', pluginName => {
      const plugin = this.DI.plugins.get(pluginName, true)
      this.plugins.set(plugin.path, plugin)
    })
    this.manager.on('unload', pluginName => {
      const plugin = this.DI.plugins.get(pluginName, true)
      this.plugins.delete(plugin.path)
    })
  }

  async load () {
    this.registerSettingsTab('Plugin Manager', require('./SettingsPage'))
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
    const key = Array.from(this.plugins.keys())[index]

    return this.DI.plguins.uninstall(key)
  }
}
