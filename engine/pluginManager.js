const { EventEmitter } = require('eventemitter3')
const fs = require('fs-extra')
const path = require('path')
const reload = require('require-reload')
const Promise = require('bluebird')
const { app, getCurrentWebContents } = require('electron').remote

const elements = require('elements')
const glob = require('globby')

class PluginManager extends EventEmitter {
  constructor (DI) {
    super()

    this.DI = DI
    this._ready = false
    this.plugins = new Map()

    // clean session storage, just to be safe
    DI.sessionStorage['DI-plugins'] = '{}'

    this.pluginsEnabled = {}
    if (DI.localStorage['DI-Plugins'] !== '') {
      try {
        this.pluginsEnabled = JSON.parse(DI.localStorage['DI-Plugins'])
      } catch (ex) {}
    }

    this.basePath = this.expand(DI.conf.pluginPath || '%/plugins')
    fs.ensureDirSync(this.basePath)
  }

  expand (basePath) {
    const discordPath = path.join(process.resourcesPath, '..', '..')

    fs.ensureDirSync(app.getPath('userData'))
    return basePath
      .replace(/\\/g, '/')
      .replace(/^\.\//, path.join(__dirname, '..') + '/')
      .replace(/^~\//, app.getPath('home') + '/')
      .replace(
        /^%%\//,
        path.join(app.getPath('appData'), 'discordinjections') + '/'
      )
      .replace(/^%\//, app.getPath('userData') + '/')
      .replace(/^&\//, discordPath)
  }

  async loadPluginPath () {
    // look through the plugin directory
    // first load all system plugins
    const plugins = await glob(['**/package.json', '!**/node_modules'], {
      cwd: this.basePath,
      absolute: true
    })
    console.info('[PM] loading plugins from', this.basePath)
    console.debug('[PM] found following plugins', plugins)

    return Promise.each(plugins, plugin => this.loadByPath(plugin))
  }

  async loadByPath (pluginPath, force = true, dependency = false) {
    let pkg = {}

    let fileName =
      path.basename(pluginPath) === 'package.json'
        ? pluginPath
        : path.join(pluginPath, 'package.json')

    let main = path.dirname(fileName)

    try {
      pkg = reload(fileName)
    } catch (err) {
      if (path.extname(pluginPath) !== '.css') {
        console.error('[PM] failed to load requested plugin!', err)
        throw new Error('plugin not found')
      } else {
        pkg = {
          name: path.basename(pluginPath, '.css'),
          version: '1.0.0',
          type: 'theme'
        }

        main = pluginPath
        fileName = pluginPath
      }
    }

    const id = this.system ? this.system.getPluginID(pkg) : 'plugins'

    if (this.plugins.has(id) && this.plugins.get(id).loaded) {
      // no need to reload an already loaded plugin
      if (
        dependency &&
        !this.plugins.get(id).reverseDependency.includes(dependency)
      ) {
        console.debug('[PM] adding reverse dependency', dependency, 'to', id)
        this.plugins.get(id).reverseDependency.push(dependency)
      }

      console.debug('[PM] plugin already loaded, skipping!', id)
      return
    }

    if (this.plugins.get(id) && this.plugins.get(id).loading) {
      console.error('[PM] circular dependency, aborting', id)
      throw new Error('circular dependency found, aborting')
    }

    const p = {
      // the base path to the plugin
      path: path.dirname(fileName),

      // main class
      main,

      // package id
      id,

      // the package.json of the plugin
      package: pkg,

      // runtime metadata
      loaded: false,
      loading: true,

      // class and instance of plugin
      Cls: null,
      inst: null,

      // dependencies
      dependency: [],
      reverseDependency: [],

      disabled: false
    }

    // store the temporary plugin
    this.plugins.set(id, p)

    // chain into the loadFromCache logic
    return this.loadFromCache(id, force, dependency)
  }

  async load (plugin, force = true, dependency = false) {
    const pluginPath = path.resolve(this.basePath, plugin)
    if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
      throw new Error('plugin not found', plugin)
    }

    return this.loadByPath(pluginPath, force, dependency)
  }

  async loadFromCache (plugin, force = true, dependency = false) {
    if (
      this.system &&
      !force &&
      this.system.isPluginEnabled(plugin) === false
    ) {
      // dont load disabled plugins
      return
    }

    if (!this.plugins.has(plugin)) {
      throw new Error(`<${plugin}> not found in registry`)
    }

    const p = this.plugins.get(plugin)

    if (dependency) {
      console.debug('[PM] adding reverse dependency', dependency, 'to', plugin)
      p.reverseDependency.push(dependency)
    }

    // check for dependencies
    if (Array.isArray(p.package.pluginDependencies)) {
      await Promise.each(p.package.pluginDependencies, async dep => {
        console.debug('[PM] adding dependency', dep, 'to', plugin)

        // is this a system plugin?
        if (this.system.isSystemPlugin(dep)) {
          await this.loadByPath(
            path.join(__dirname, 'plugins', dep),
            true,
            plugin
          )
          p.dependency.push(dep)
        } else {
          console.warn('DEPTREE LUL!!')
          this.load(dep, true, true)
        }
      })
    }

    // load the plugin
    switch (p.package.type) {
      case 'theme':
        try {
          require.resolve(p.main)
        } catch (err) {
          // its a simple css theme without js extension
          p.main = elements.Theme
        }
        break

      case 'plugin':
      default:
        // default behavior
        break
    }

    p.Cls = reload(p.main) // loads index.js or file defined in package.json > "main"
    try {
      p.inst = new p.Cls(this, p) // creates the plugin instance
    } catch (err) {
      console.error('[PM] failed to instanciate plugin', plugin, err)
      throw err
    }

    if (!(p.inst instanceof elements.Plugin)) {
      console.error('[PM] cannot instanciate an unkown module', plugin)
      throw new Error('unkown module loaded!')
    }

    // preload the plugin
    try {
      await p.inst._preload()
    } catch (err) {
      console.error('[PM] failed to preload plugin', plugin, err)
      throw err
    }
    p.loaded = true
    p.loading = false

    // if we are already running, load the module immediatly
    if (this._ready) {
      p.inst._load().then(() => this.emit('load', plugin))
    }

    // return the (partially) loaded plugin
    return p
  }

  async unload (id) {
    if (!this.plugins.has(id)) {
      return true
    }

    const p = this.plugins.get(id)

    if (p.loaded) {
      if (this._ready) {
        this.emit('unload', id)
      }

      // unload
      await Promise.resolve(p.inst._unload())
      p.inst = null
      p.loaded = false
    }

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
    this.emit('plugins-preloaded', Array.from(this.plugins.keys()))

    const loaders = []
    for (let p of this.plugins.values()) {
      if (p.loaded && p.inst) {
        loaders.push(p.inst._load())
      }
    }

    return Promise.all(loaders).then(() =>
      this.emit('plugins-loaded', Array.from(this.plugins.keys()))
    )
  }

  get (name, raw = false) {
    if (
      !this.plugins ||
      !this.plugins.has(name) ||
      !this.plugins.get(name).loaded
    ) {
      return null
    }

    return raw ? this.plugins.get(name) : this.plugins.get(name).inst
  }

  async initialize () {
    // load the most important and initial plugin, me >:D
    const { inst: system } = await this.loadByPath(
      path.join(__dirname, 'plugins', 'plugins')
    )
    this.system = system
    await system.loadPlugins()

    if (document.readyState !== 'loading') {
      setImmediate(() => this.ready())
    } else {
      getCurrentWebContents().on('dom-ready', () => this.ready())
    }
  }
}

module.exports = PluginManager
