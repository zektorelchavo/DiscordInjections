const Command = require('./command')
const EventEmitter = require('eventemitter3')
const path = require('path')
const Watcher = module.parent.require('../lib/watcher')
const fs = require('fs-extra')
const Promise = require('bluebird')

class Plugin extends EventEmitter {
  constructor (pm, meta) {
    super()

    this.manager = pm
    this.DI = pm.DI
    this.meta = meta
    if (this.constructor === Plugin) {
      throw new Error('Cannot instantiate an abstract class!')
    }
    this._id = meta.id
    this._name = meta.package.name
    this._commands = []
    this.log('created from', meta.path)
  }

  /**
   * Overwrite to set a custom icon URL
   */
  get iconURL () {
    if (!this.hash) {
      this.hash =
        this._name.split('').reduce(function (a, b) {
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

  async _preload () {
    this.path = path
    this._verifyPackage()
    await Promise.resolve(this.preload())
    this.loadCSSStack(this.watchCSSbyDefault)
    this.log('preloaded')
  }

  async _load () {
    this.load()
    this.log('loaded')
  }

  _verifyPackage () {
    if (
      !this.meta.package.hasOwnProperty('author') ||
      !this.meta.package.hasOwnProperty('version') ||
      !this.meta.package.hasOwnProperty('description')
    ) {
      throw new Error('A plugin must have an author, version, and description')
    }
  }

  _unload () {
    for (const command of this._commands) {
      this.DI.CommandHandler.unhookCommand(command.name)
    }

    Array.from(
      document.querySelectorAll(`style[data-plugin="${this._id}"]`)
    ).forEach(el => el.remove())

    this.removeAllListeners()

    this.unload()
    this.log('unloaded')
  }

  /**
   * Functionality to call when the plugin is preloaded
   *
   * During this stage, Discord and Plugins are probably not loaded.
   */
  preload () {}

  /**
   * Functionality to call when the plugin is loaded
   */
  load () {}

  /**
   * Functionality to call when the plugin is unloaded
   */
  unload () {}

  /**
   * Is called when settings changed
   */
  settingsChanged () {}

  /**
   * Overwrite to customize plugin color
   */
  get color () {
    return 0x444444
  }

  getSettingsNode (node, defaultValue) {
    let entry = this.settings
    let nodes = node.split('.')
    let current = entry
    let update = false
    for (let i = 0; i < nodes.length - 1; i++) {
      if (typeof current === 'object') {
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

  setSettingsNode (node, value) {
    let entry = this.settings
    let nodes = node.split('.')
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

  get settings () {
    try {
      let res = JSON.parse(this.DI.localStorage.getItem('DI-' + this._name))
      if (res === null) {
        this.settings = {}
        return {}
      } else return res
    } catch (err) {
      this.settings = {}
      return {}
    }
  }

  get hasSettings () {
    return this.DI.localStorage.getItem('DI-' + this._name) !== null
  }

  set settings (val) {
    this.DI.localStorage.setItem('DI-' + this._name, JSON.stringify(val))
    this.settingsChanged()
  }

  log (...args) {
    this.console('log', ...args)
  }

  debug (...args) {
    this.console('debug', ...args)
  }

  info (...args) {
    this.console('info', ...args)
  }

  warn (...args) {
    this.console('warn', ...args)
  }

  error (...args) {
    this.console('error', ...args)
  }

  console (action, ...args) {
    console[action](
      `%c[${this._id}]`,
      `color: #${this.color}; font-weight: bold; `,
      ...args
    )
  }

  get currentGuildID () {
    const pathParts = window.location.pathname.split('/')
    return +pathParts[2] || null // convert "@me" to null
  }

  get currentChannelID () {
    const pathParts = window.location.pathname.split('/')
    return pathParts.length >= 4 ? pathParts[3] : null
  }

  get deleteNode () {
    const n = this.manager
      .get('react')
      .createElement(
        `<div class="local-bot-message">Only you can see this — <a rel="noreferrer">delete this message</a>.</div>`
      ).firstElementChild
    n.addEventListener('click', ev => {
      const grp = ev.target.closest('[data-di-local]')
      const lst = grp.parentElement
      grp.remove()
      if (lst.lastElementChild.classList.contains('divider')) {
        lst.lastElementChild.remove()
      }
    })

    return n
  }

  registerCommand (options) {
    const command = new Command(this, options)
    this.manager.get('commands').hookCommand(command)
  }

  registerSettingsTab (name, component) {
    this.manager.get('settings')._registerSettingsTab(this, name, component)
  }

  sendLocalMessage (message, channel = null) {
    const react = this.manager.get('hooks')
    const handler = react._messageHandler

    const channelID = channel || this.currentChannelID
    if (!channelID) {
      return false
    }

    // build the bot message
    const timestamp = new Date()
    let id = ((timestamp.getTime() - 1420070400000) * 4194304).toString()

    const o = {
      attachments: [],
      embeds: [],
      edited_timestamp: null,
      mention_everyone: false,
      mention_roles: [],
      mentions: [],
      pinned: false,
      tts: false,
      type: 0,

      id,
      nonce: id,
      channel_id: channelID,

      author: {
        avatar: 'test',
        discriminator: '0000',
        id: 'DI-' + this.meta.id,
        username: this.meta.username
      },
      timestamp: timestamp.toISOString(),
      content: message
    }

    handler.receiveMessage(channelID, o)
    const grp = document.querySelector('.message-group:last-child')
    grp.classList.add('is-local-bot-message')
    grp.dataset.diLocal = 'true'

    grp.firstElementChild.style.backgroundImage = `url(${this.iconURL})`
    Array.from(grp.querySelectorAll('.local-bot-message')).forEach(e =>
      e.remove()
    )

    grp.lastElementChild.appendChild(this.deleteNode)
  }

  get watchCSSbyDefault () {
    return false
  }

  loadCSSStack (watch = false) {
    if (!this.meta.package.css) {
      return
    }

    return Promise.each(this.meta.package.css, file =>
      this.loadCSS(file, watch)
    )
  }

  async loadCSS (file, watch = false) {
    if (watch && !this.watcher) {
      this.watcher = new Watcher()

      this.watcher.on('change', (fileName, identifier) =>
        this._onFileChange(identifier, fileName)
      )
    }

    const cssPath = path.resolve(this.meta.path, file)
    try {
      let content = await fs.readFile(cssPath, 'utf-8')
      content = await this.DI.postcss.process(content, {
        from: cssPath,
        to: cssPath,
        map: {
          annotation: false,
          inline: false,
          safe: false
        }
      })

      let el = document.querySelector(
        `style[data-plugin="${this._id}"][data-filename="${file.replace(
          /\\/g,
          '\\\\'
        )}"]`
      )
      if (!el) {
        this.info('Attaching css file', file)
        document.body.appendChild(this._createStyle(content, this._id, file))
      } else {
        this.info('Updating css file', file)
        while (el.firstChild) {
          el.firstChild.remove()
        }
        el.appendChild(document.createTextNode(content))
      }

      if (watch) {
        this.watcher.addFile(cssPath)
      }
    } catch (err) {
      this.error('Failed to import css file', this._name, err)
    }
  }
  _createStyle (content, plugin, filename) {
    const style = document.createElement('style')
    style.dataset.plugin = plugin
    style.dataset.filename = filename
    style.appendChild(document.createTextNode(content))
    return style
  }

  async _onFileChange (fileName, filePath) {
    this.loadCSS(fileName)
  }
}

module.exports = Plugin
