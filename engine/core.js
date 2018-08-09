const { EventEmitter } = require('eventemitter3')
const fs = require('fs-extra')
const path = require('path')
const Promise = require('bluebird')
const { app, getCurrentWebContents } = require('electron').remote
const glob = require('globby')
const Module = require('module')

const util = require('./util')
const API = require('./api')

const postcss = require('postcss')
const postcssImport = require('postcss-import')
const postcssUrl = require('postcss-url')

class Core extends EventEmitter {
  static expand (basePath) {
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

  constructor (conf, localStorage) {
    super()

    this.conf = conf
    this._ready = false
    this._readyCallbacks = []

    this.localStorage = localStorage
    this._webpackCache = util.webpackRequireCache()

    this.plugins = new Map()
    this.settings = {}

    let settingsString = localStorage['DI']
    if (settingsString) {
      this.settings = JSON.parse(settingsString)
    } else {
      settingsString = localStorage['DI-plugins']
      if (settingsString) {
        this.settings.plugins = {}
        const settings = JSON.parse(settingsString)
        settings.plugins = settings.plugins || {}

        Object.keys(settings.plugins).forEach(pluginName => {
          this.settings.plugins['DI#' + pluginName] = Object.assign(
            settings.plugins[pluginName],
            {
              provider: 'DI',
              name: pluginName
            }
          )
        })
      }

      localStorage['DI'] = JSON.stringify(this.settings)
    }

    this._mLoad = Module._load
    Module._load = (request, parent, isMain) => {
      switch (request) {
        case 'elements':
        case 'react':
          // try the require resolve method
          let newPath = request
          try {
            newPath = require.resolve(request)
          } catch (err) {
            // filter the current cache and hope for the best
            newPath = Object.keys(require.cache)
              .filter(
                mod =>
                  mod.includes(path.sep + request + path.sep) &&
                  mod.includes('index.js')
              )
              .pop()
          }

          return this._mLoad(newPath, parent, isMain)
      }
      return this._mLoad(request, parent, isMain)
    }

    this.basePath = Core.expand(conf.pluginPath || '%/plugins')
    fs.ensureDirSync(this.basePath)
  }

  get package () {
    return require('../package.json')
  }

  get version () {
    return this.package.version
  }

  get contributors () {
    if (!this._contributors) {
      Object.defineProperty(this, '_contributors', {})
      this._contributors = {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      }

      fs
        .readFileSync(path.join(__dirname, '..', 'CONTRIBUTORS.md'), 'utf-8')
        .split('\n')
        .filter(line => line.startsWith('*'))
        .map(line => line.match(/\*\*(.+)\*\* <!-- (\d+) -->/))
        .forEach(([_, name, id]) => (this._contributors[id] = name))
    }

    return this._contributors
  }

  get postcss () {
    if (!this._postcss) {
      this._postcss = postcss([
        postcssImport(),
        postcssUrl({
          url: 'inline'
        })
      ])
    }
    return this._postcss
  }

  async loadPluginPath () {
    // look through the plugin directory
    // first load all system plugins
    const plugins = await glob(['**/package.json', '!**/node_modules'], {
      cwd: this.basePath,
      absolute: true
    })

    console.info('[engine/core] loading plugins from', this.basePath)
    console.debug('[engine/core] found following plugins', plugins)

    return Promise.each(plugins, plugin => this.loadByPath(plugin, false))
  }

  onReady (cb) {
    if (this._ready) {
      cb()
    } else {
      this._readyCallbacks.push(cb)
    }
  }

  ready () {
    if (this._ready) {
      return
    }

    this._ready = true
    this.emit('ready')
    return Promise.all(this._readyCallbacks.map(cb => cb())).then(() => {
      this.emit('loaded')
    })
  }

  async load (plugin, force = true, dependency = null, formatProvider = null) {
    // this is opinionated af
    if (!formatProvider) {
      formatProvider = API.defaultFormat
    }

    const Provider = API.formats[formatProvider]

    const pluginPath = Provider.resolve(plugin, [
      path.join(__dirname, 'plugins'),
      this.basePath
    ])

    return this.loadByPath(pluginPath, force, dependency, formatProvider)
  }

  async loadByPath (
    pluginPath,
    force = true,
    dependency = null,
    formatProvider = null
  ) {
    let api = null
    try {
      if (!formatProvider) {
        api = API.detectFormat(pluginPath)
      } else {
        api = API.loadFormat(formatProvider, pluginPath)
      }
    } catch (err) {
      console.error('[engine/core] failed to load plugin!', pluginPath, err)
      return
    }

    if (!this.isPluginEnabled(api.id) && !force) {
      console.warn(`[engine/core] <${api.id}> disabled, skipping!`)
      return
    }

    if (this.plugins.has(api.id)) {
      // plugin with same id is already loaded!
      console.debug(
        `[engine/core] there is already a plugin <${api.id}> loaded, skipping load process.`
      )

      const p = this.plugins.get(api.id)
      try {
        await p.use(api.id)
        return p
      } catch (err) {
        console.error(`[engine/core] <${api.id}> failed to confirm load`, err)
        return null
      }
    } else {
      console.debug(`[engine/core] loading <${api.id}>`)
      this.plugins.set(api.id, api)
      api.connect(this)
      return api.load(force, dependency)
    }
  }

  /*
  async loadFromCache (plugin, force = true, dependency = false) {
    const p = this.plugins.get(plugin)

    if (
      this.system &&
      !force &&
      this.system.isPluginEnabled(plugin) === false
    ) {
      p.loading = false
      p.loaded = false
      // dont load disabled plugins
      return
    }

    if (!this.plugins.has(plugin)) {
      throw new Error(`<${plugin}> not found in cache!`)
    }

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
          this.load(dep, true, true)
        }
      })
    }

    // load the plugin
    switch (p.package.type) {
      case 'theme':
        try {
          p.Cls = reload(p.main)
        } catch (err) {
          // its a simple css theme without js extension
          p.Cls = elements.Theme
        }
        break

      case 'plugin':
      default:
        // default behavior
        p.Cls = reload(p.main) // loads index.js or file defined in package.json > "main"

        break
    }

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

  async uninstall (id) {
    const plugin = this.plugins.get(id)
    this.emit('before-uninstall', id)
    // first unload
    await this.unload(id)

    this.emit('uninstall', id)

    // remove the plugin reference
    this.plugins.delete(id)

    // is this a load path plugin?
    if (path.relative(this.basePath, plugin.path) === id) {
      // delete the full path
      return fs.remove(plugin.path)
    } else {
      // remove the reference in the custom tree
      return this.system.removeLocal(id)
    }
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
  */

  get (name, raw = false) {
    let plugin = null
    if (this.plugins.has(name)) {
      plugin = this.plugins.get(name)
    }

    if (!name.includes('#')) {
      const possibleKeys = Array.from(this.plugins.keys()).filter(
        k => k.split('#')[1] === name
      )
      plugin = this.plugins.get(possibleKeys[0])
    }

    if (plugin && raw) {
      return plugin
    } else {
      return plugin ? plugin.instance : null
    }
  }

  isSystemPlugin (fullID) {
    let [format, id] = fullID.split('#')
    if (format !== 'DI') {
      return false
    }

    return fs.existsSync(path.join(__dirname, 'plugins', id, 'package.json'))
  }

  isPluginEnabled (id) {
    if (this.isSystemPlugin(id)) {
      return true
    }

    if (!this.settings.plugins[id]) {
      return true
    } else {
      return !this.settings.plugins[id].disabled
    }
  }

  async loadPlugins () {
    // force load plugin controller first
    this.loadByPath(path.join(__dirname, 'plugins', 'plugins'), true)

    // first load all system plugins
    const systemPlugins = await glob('plugins/*/package.json', {
      cwd: __dirname,
      absolute: true
    })

    await Promise.each(systemPlugins, pkg => this.loadByPath(pkg, true))

    // now check the plugin path
    await this.loadPluginPath()

    // last, but not least, load the missing plugins
    if (!this.settings.plugins) {
      return
    }

    return Object.keys(this.settings.plugins)
      .map(k => this.settings.plugins[k])
      .filter(p => p.path)
      .forEach(p => this.loadByPath(p.path, false))
  }

  async initialize () {
    await this.loadPlugins()

    if (document.readyState !== 'loading') {
      setImmediate(() => this.ready())
    } else {
      getCurrentWebContents().on('dom-ready', () => this.ready())
    }
  }
}

module.exports = Core
