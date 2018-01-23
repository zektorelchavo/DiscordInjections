const Command = require("./command")
const EventEmitter = require("eventemitter3")
const path = require("path")

class Plugin extends EventEmitter {
  constructor(pm, meta) {
    super()

    this.manager = pm
    this.DI = pm.DI
    this.meta = meta
    if (this.constructor == Plugin) {
      throw new Error("Cannot instantiate an abstract class!")
    }
    this._name = meta.package.name
    this._commands = []
    this.log("created")
  }

  /**
   * Overwrite to set a custom icon URL
   */
  get iconURL() {
    if (!this.hash) {
      this.hash =
        this._name.split("").reduce(function(a, b) {
          a = (a << 5) - a + b.charCodeAt(0)
          return a & a
        }, 0) % 4
    }
    switch (this.hash) {
      case 0:
        return `https://discordinjections.xyz/img/logo-alt-green.svg`
      case 1:
        return `https://discordinjections.xyz/img/logo-alt-grey.svg`
      case 2:
        return `https://discordinjections.xyz/img/logo-alt-red.svg`
      case 3:
        return `https://discordinjections.xyz/img/logo-alt-yellow.svg`
    }
  }

  async _preload() {
    this.path = path
    this._verifyPackage()
    await Promise.resolve(this.preload())
    this.log("preloaded")
  }

  _load() {
    this.load()
    this.log("loaded")
  }

  _verifyPackage() {
    if (
      !this.meta.package.hasOwnProperty("author") ||
      !this.meta.package.hasOwnProperty("version") ||
      !this.meta.package.hasOwnProperty("description")
    ) {
      throw new Error("A plugin must have an author, version, and description")
    }
  }

  _unload() {
    for (const command of this._commands) {
      this.DI.CommandHandler.unhookCommand(command.name)
    }
    if (this._cssWatcher) this._cssWatcher.close()
    let cssElement = document.getElementById(`CSS-${this._name}`)
    if (cssElement) cssElement.parentElement.removeChild(cssElement)

    this.removeAllListeners()

    this.unload()
    this.log("unloaded")
  }

  /**
   * Functionality to call when the plugin is preloaded
   *
   * During this stage, Discord and Plugins are probably not loaded.
   */
  preload() {}

  /**
   * Functionality to call when the plugin is loaded
   */
  load() {}

  /**
   * Functionality to call when the plugin is unloaded
   */
  unload() {}

  /**
   * Is called when settings changed
   */
  settingsChanged() {}

  /**
   * Overwrite to customize plugin color
   */
  get color() {
    return 0x444444
  }

  getSettingsNode(node, defaultValue) {
    let entry = this.settings
    let nodes = node.split(".")
    let current = entry
    let update = false
    for (let i = 0; i < nodes.length - 1; i++) {
      if (typeof current === "object") {
        if (!current.hasOwnProperty(nodes[i])) {
          current[nodes[i]] = {}
          update = true
        }
        current = current[nodes[i]]
      }
    }
    if (!current.hasOwnProperty(nodes[nodes.length - 1])) {
      current[nodes[nodes.length - 1]] = defaultValue
      update = true
    }
    if (update) this.settings = entry

    return current[nodes[nodes.length - 1]]
  }

  setSettingsNode(node, value) {
    let entry = this.settings
    let nodes = node.split(".")
    let current = entry
    for (let i = 0; i < nodes.length - 1; i++) {
      if (current[nodes[i]] === undefined || current[nodes[i]] === null) {
        current[nodes[i]] = {}
      } else {
        current = current[nodes[i]]
      }
    }
    current[nodes[nodes.length - 1]] = value
    this.settings = entry
  }

  get settings() {
    try {
      let res = JSON.parse(this.DI.localStorage.getItem("DI-" + this._name))
      if (res === null) {
        this.settings = {}
        return {}
      } else return res
    } catch (err) {
      this.settings = {}
      return {}
    }
  }

  get hasSettings() {
    return this.DI.localStorage.getItem("DI-" + this._name) !== null
  }

  set settings(val) {
    this.DI.localStorage.setItem("DI-" + this._name, JSON.stringify(val))
    this.settingsChanged()
  }

  log(...args) {
    this.console("log", ...args)
  }

  info(...args) {
    this.console("log", ...args)
  }

  warn(...args) {
    this.console("warn", ...args)
  }

  error(...args) {
    this.console("error", ...args)
  }

  console(action, ...args) {
    console[action](
      `%c[${this._name}]`,
      `color: #${this.color}; font-weight: bold; `,
      ...args
    )
  }

  registerCommand(options) {
    const command = new Command(this, options)
    this.manager.get("commands").hookCommand(command)
  }

  registerSettingsTab(name, component) {
    this.manager.get("settings")._registerSettingsTab(this, name, component)
  }
  /*
  sendLocalMessage (message, sanitize) {
    return this.DI.Helpers.sendLog(this._name, message, this.iconURL, sanitize)
  }*/
}

module.exports = Plugin
