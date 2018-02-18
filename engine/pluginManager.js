const { EventEmitter } = require('eventemitter3')
const fs = require('fs-extra')
const path = require('path')
const reload = require('require-reload')
const Promise = require('bluebird')

class PluginManager extends EventEmitter {
  constructor (DI) {
    super()
    this.DI = DI
    this._ready = false
    this.plugins = {}

    this.pluginsEnabled = {}
    if (DI.localStorage['DI-Plugins'] != '') {
      try {
        this.pluginsEnabled = JSON.parse(DI.localStorage['DI-Plugins'])
      } catch (ex) {}
    }

    this.basePath = this.expand(DI.conf.pluginPath || './Plugins')
    fs.ensureDirSync(this.basePath)

    const dependencies = []
  }

  expand (basePath) {
    const home =
      process.env.HOME ||
      process.env.USERPROFILE ||
      process.env.HOMEDRIVE + process.env.HOMEPATH
    const appData = process.env.HOME
      ? path.join(process.env.HOME, '.config', 'DiscordInjections')
      : path.join(process.env.APPDATA, 'DiscordInjections')
    const discordPath = path.join(process.resourcesPath, '..', '..')

    fs.ensureDirSync(appData)
    return basePath
      .replace(/\\/g, '/')
      .replace(/^\.\//, path.join(__dirname, '..') + '/')
      .replace(/^~\//, home + '/')
      .replace(/^%\//, appData)
      .replace(/^\&\//, discordPath)
  }

  loadPluginPath () {
    // look through the plugin directory
    return (
      Promise.resolve(fs.readdir(this.basePath))
        // prefix basepath
        .map(f => path.join(this.basePath, f))
        // filter out non directories
        .filter(
          f => fs.statSync(f).isDirectory() || path.extname(f) === '.asar'
        )
        // filter out non node modules
        .filter(f => fs.existsSync(path.join(f, 'package.json')))
        // load dem plugins
        .each(m => {
          return this.load(m, false)
        })
        .then(() => this.emit('plugins-preloaded', Object.keys(this.plugins)))
    )
  }

  async loadByPath (pluginPath, force = true, dependency = false) {
    const fileName =
      path.basename(pluginPath) === 'package.json'
        ? pluginPath
        : path.join(pluginPath, 'package.json')

    const pkg = reload(fileName)
    if (!force && this.pluginsEnabled[pkg.name] === false) {
      // dont load disabled plugins
      return
    }

    if (this.plugins[pkg.name] && this.plugins[pkg.name].loaded) {
      // no need to reload an already loaded plugin
      return
    }

    if (this.plugins[pkg.name] && this.plugins[pkg.name].loading) {
      throw new Error('circular dependency found, aborting!')
    }

    const p = (this.plugins[pkg.name] = {
      path: pluginPath,
      package: pkg,
      loaded: false,
      loading: true,
      cls: null,
      inst: null,
      dependency,
      core: false
    })

    // check for dependencies
    if (Array.isArray(pkg.pluginDependencies)) {
      await Promise.each(pkg.pluginDependencies, dep =>
        this.load(dep, true, true)
      )
    }

    // load the plugin
    p.cls = reload(pluginPath)
    p.inst = new p.cls(this, p)
    p.loaded = true
    p.loading = false

    await p.inst._preload()

    if (this._ready) {
      p.inst._load()
      this.emit('load', pkg.name)
    }
  }

  async load (plugin, force = true, dependency = false) {
    const pluginPath = path.resolve(this.basePath, plugin)
    if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
      throw new Error('plugin not found', plugin)
    }

    return this.loadByPath(pluginPath, force, dependency)
  }

  async unload (name) {
    if (!this.plugins[name] || !this.plugins[name].loaded) {
      return true
    }

    if (this._ready) {
      this.emit('unload', name)
    }

    const p = this.plugins[name]
    // unload
    await Promise.resolve(p.inst._unload())
    p.inst = null
    p.loaded = false
    return true
  }

  async reload (name, recursive = false) {
    if (!this.plugins[name]) {
      return this.load(name, true)
    }

    const p = this.plugins[name]
    if (recursive) {
      await Promise.each(p.package.pluginDependencies, dep =>
        this.reload(dep, recursive)
      )
    }

    await this.unload(name)
    return await this.load(name)
  }

  async install (pluginPath) {
    const fileName =
      path.basename(pluginPath) === 'package.json'
        ? pluginPath
        : path.join(pluginPath, 'package.json')

    const pkg = require(fileName)

    if (this.plugins[pkg.name]) {
      throw new Error('Plugin', pkg.name, 'already loaded!')
    }

    await fs.ensureDir(path.join(pluginPath, pkg.name))
    await fs.copy(path.basename(fileName), path.join(pluginPath, pkg.name))
    return this.loadByPath(fileName)
  }

  async uninstall (name) {
    const plugin = this.get(name, true)
    this.emit('before-uninstall', name)
    // first unload
    await this.unload(name)

    // now remove the directory tree
    delete this.plugins[name]
    this.emit('uninstall', name)
    return fs.remove(plugin.path)
  }

  async remove (name, unload = true) {
    const pluginPath = path.resolve(this.basePath, name)
    if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
      throw new Error('plugin not found', name)
    }

    if (unload) {
      return this.unload(name)
    }
  }

  async enable (name, load = false) {
    const pluginPath = path.resolve(this.basePath, name)
    if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
      throw new Error('plugin not found', name)
    }

    this.pluginsEnabled[name] = true
    if (load) {
      return this.load(name)
    }

    return true
  }

  async disable (name, unload = false) {
    const pluginPath = path.resolve(this.basePath, name)
    if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
      throw new Error('plugin not found', name)
    }

    this.pluginsEnabled[name] = false
    if (unload) {
      return this.unload(name)
    }

    return true
  }

  ready () {
    if (this._ready) {
      return
    }

    this._ready = true
    return Promise.each(
      Object.keys(this.plugins).map(n => this.plugins[n]),
      p => {
        if (p.loaded && p.inst) {
          p.inst._load()
        }
      }
    ).then(() => this.emit('plugins-loaded', Object.keys(this.plugins)))
  }

  get (name, raw = false) {
    if (!this.plugins || !this.plugins[name] || !this.plugins[name].loaded) {
      return null
    }

    return raw ? this.plugins[name] : this.plugins[name].inst
  }
}

module.exports = PluginManager
