const { Plugin } = require('elements')
const React = require('react')
const ReactDOM = require('react-dom')
const util = require('util')

module.exports = class settings extends Plugin {
  preload () {
    const r = (this.react = this.manager.get('react'))

    this.map = {}
    this.order = []

    r.on('settingsOpened', () => this.injectSettingsTab())
    r.on('languageChange', () => this.injectSettingsTab())
    r.on('settingsClosed', () => {
      for (const key in this.map) {
        this.map[key].tab.className = this.unselectedCss
      }
    })

    r.on('settingsTab', type => {
      if (!type || type === 'unknown') return

      if (this.map.hasOwnProperty(type)) {
        const element = document.querySelector(
          '[class*="layer"] .sidebar [class*=selected]'
        )
        if (element) element.className = this.unselectedCss
        this.map[type].tab.className = this.selectedCss

        ReactDOM.render(
          React.createElement(require('./SettingsBase'), {
            component: this.map[type].component,
            plugin: this.map[type].plugin,
            title: this.map[type].name,
            id: this.map[type].elementID
          }),
          document.querySelector('[class*="layer"] .content-column div')
        )
      } else {
        for (const key in this.map) {
          this.map[key].tab.className = this.unselectedCss
        }
      }
    })

    this.header = document.createElement('div')
    this.header.className = 'header-1-f9X5 header-2RyJ0Y'
    this.header.appendChild(document.createTextNode('Discord Injections'))

    this.divider = document.createElement('div')
    this.divider.className =
      'separator-3z7STW marginTop8-2gOa2N marginBottom8-1mABJ4 separator-gCa7yv marginTop8-1DLZ1n marginBottom8-AtZOdT'

    this.manager.on('unload', plugin => {
      Object.keys(this.map)
        .map(id => this.map[id])
        .filter(tab => tab.plugin._name === plugin)
        .forEach(tab => delete this.map[tab.id])
    })
  }

  load () {}

  get iconURL () {
    return '//discordinjections.xyz/img/logo.png'
  }

  _registerSettingsTab (plugin, name, component, elementID) {
    if (arguments.length === 2) {
      component = name
      name = plugin._id
    } else if (arguments.length === 3) {
      if (!util.isString(name)) {
        elementID = component
        component = name
        name = plugin._name
      } else {
        elementID = (plugin._id + '-' + name).replace(/[^-a-zA-Z0-9_]/g, '_')
      }
    }

    const id = `di-${plugin._id}-${name}`
    const tab = document.createElement('div')
    tab.className = this.unselectedCss
    tab.appendChild(document.createTextNode(name))

    tab.onclick = () => {
      this.react.emit('settingsTab', id)
    }

    this.map[id] = {
      tab,
      component,
      id,
      elementID,
      name,
      plugin
    }
    this.debug('Pushing settings tab', plugin, id)
    this.order.push(id)
  }

  get unselectedCss () {
    return 'itemDefault-3NDwnY item-3879bf notSelected-PgwTMa itemDefault-3Jdr52 item-PXvHYJ notSelected-1N1G5p'
  }

  get selectedCss () {
    return 'itemSelected-3XxAMf item-3879bf selected-eNoxEK itemSelected-1qLhcL item-PXvHYJ selected-3s45Ha'
  }

  get settingsTabs () {
    return document.querySelector('[class*="layer"] .sidebar [class*=side]')
  }

  injectSettingsTab () {
    if (!this.settingsTabs) return

    const el = this.settingsTabs.querySelector('[class*="socialLinks"]')
    if (!el) return

    const header =
      el.previousElementSibling.previousElementSibling.previousElementSibling
        .previousElementSibling.previousElementSibling // divider // logout // divider // changelog // divider

    this.settingsTabs.insertBefore(this.divider, header)
    this.settingsTabs.insertBefore(this.header, header)
    console.log(this.order)
    this.order.forEach(key =>
      this.settingsTabs.insertBefore(this.map[key].tab, header)
    )
  }
}
