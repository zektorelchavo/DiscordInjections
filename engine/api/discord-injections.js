const fs = require('fs-extra')
const path = require('path')
const glob = require('globby')
const elements = require('../../elements')
const Promise = require('bluebird')

class Provider {
  static normalizePath (pluginPath, includePackageJson = false) {
    let normalizedPath = pluginPath
    if (path.basename(normalizedPath) === 'package.json') {
      normalizedPath = path.dirname(normalizedPath)
    }

    if (includePackageJson) {
      normalizedPath = path.join(normalizedPath, 'package.json')
    }

    return normalizedPath
  }
  static supports (pluginPath) {
    pluginPath = Provider.normalizePath(pluginPath, true)

    if (!fs.existsSync(pluginPath)) {
      return false
    }

    try {
      const pkg = require(pluginPath)

      return (
        pkg.keywords &&
        (pkg.keywords.includes('di-plugin') ||
          pkg.keywords.includes('di-theme'))
      )
    } catch (err) {
      console.error(
        '[engine/api/discord-injections] failed to load package file',
        err
      )
      return false
    }
  }

  static resolve (id, pluginPaths) {
    console.debug(
      `[engine/api/discord-injections] resolving <${id}> from ${JSON.stringify(
        pluginPaths
      )}`
    )
    for (let pp of pluginPaths) {
      const packages = glob.sync('**/package.json', {
        cwd: pp,
        absolute: true
      })

      for (var pkgPath of packages) {
        const pkg = require(pkgPath)
        if (pkg.name === id) {
          return pkgPath
        }
      }
    }

    throw new Error(`[engine/api/discord-injections] could not resolve <${id}>`)
  }

  constructor (pluginPath) {
    this.path = Provider.normalizePath(pluginPath)
    this.package = require(path.join(this.path, 'package.json'))
    this.loadedBy = new Set()
  }

  get Class () {
    if (this.package.type === 'theme' && !this.package.main) {
      return elements.Theme
    } else {
      return require(this.path)
    }
  }

  get id () {
    return `DI#${this.package.name}`
  }

  use (dependency = null) {
    if (this.loading) {
      throw new Error(
        '[engine/api/discord-injections] already loading, most likely a circular dependency. aborting!'
      )
    }

    return this.load(true, dependency)
  }

  connect (DI) {
    this.DI = DI
  }

  async load (force = false, dependency = null) {
    if (dependency) {
      console.debug(
        `[engine/api/discord-injections] ${this
          .id} got requested by ${dependency}`
      )
      // depdendency loads this
      this.loadedBy.add(dependency)
    }

    if (this.loaded) {
      return true
    }

    this.loading = true

    if (!force && !this.DI.isPluginEnabled(this.id) && !dependency) {
      this.loading = false
      console.log('[engine/api/discord-injections] plugin disabled')
      return false
    }

    // check for dependencies
    if (Array.isArray(this.package.pluginDependencies)) {
      await Promise.each(this.package.pluginDependencies, async dep => {
        console.debug(`[engine/api/discord-injections] ${this.id} loads ${dep}`)
        return this.DI.load(dep, true, this.id, 'discord-injections')
      })
    }

    // load the plugin
    this.instance = new this.Class(this.DI, this)

    if (!(this.instance instanceof elements.Plugin)) {
      throw new Error(
        '[engine/api/discord-injections] cannot instanciate an unkown module'
      )
    }

    // preload the plugin
    console.debug(
      `[engine/api/discord-injections] <${this.id}> executing preload`
    )
    await this.instance._preload()
    this.loaded = true
    this.loading = false

    // queue up loader
    this.DI.onReady(() => this._finishLoad())

    return true
  }

  async _finishLoad () {
    console.debug(`[engine/api/discord-injections] <${this.id}> executing load`)
    await this.instance._load()
    this.DI.emit('load', this)
  }
}

module.exports = Provider
