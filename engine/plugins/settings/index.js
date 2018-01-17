const Plugin = module.parent.require("../components/plugin")

module.exports = class settings extends Plugin {
  preload() {
    const r = (this.react = this.manager.get("react"))

    this.map = {}

    r.on("settingsOpened", () => this.injectSettingsTab())
    r.on("languageChange", () => this.injectSettingsTab())
    r.on("settingsClosed", () => {
      for (const key in this.map) {
        this.map[key].tab.className = this.unselectedCss
      }
    })

    r.on("settingsTab", type => {
      if (this.map.hasOwnProperty(type)) {
        const element = document.querySelector(
          '[class*="layer"] .sidebar .selected-eNoxEK'
        )
        element.className = this.unselectedCss
        this.map[type].tab.className = this.selectedCss

        ReactDOM.render(
          React.createElement(require("./SettingsBase"), {
            component: this.map[type].component,
            plugin: this.map[type].plugin,
            title: this.map[type].name
          }),
          document.querySelector('[class*="layer"] .content-column div')
        )
      } else {
        for (const key in this.map) {
          this.map[key].tab.className = this.unselectedCss
        }
      }
    })

    this.header = document.createElement("div")
    this.header.className = "header-1-f9X5"
    this.header.appendChild(document.createTextNode("Discord Injections"))

    this.divider = document.createElement("div")
    this.divider.className =
      "separator-3z7STW marginTop8-2gOa2N marginBottom8-1mABJ4"

    this.manager.on("unload", plugin => {
      Object.keys(this.map)
        .map(id => this.map[id])
        .filter(tab => tab.plugin._name === plugin)
        .forEach(tab => delete this.map[tab.id])
    })
  }

  load() {
    this._registerSettingsTab(
      this,
      "General Settings",
      require("./SettingsGeneral")
    )
  }

  _registerSettingsTab(plugin, name, component) {
    if (name && !component) {
      component = name
      name = plugin._name
    }

    const id = `di-${plugin._name}-${name}`
    const tab = document.createElement("div")
    tab.className = this.unselectedCss
    tab.appendChild(document.createTextNode(name))

    tab.onclick = () => {
      this.react.emit("settingsTab", id)
    }

    this.map[id] = {
      tab,
      component,
      id,
      name,
      plugin
    }
  }

  get unselectedCss() {
    return "itemDefault-3NDwnY item-3879bf notSelected-PgwTMa"
  }

  get selectedCss() {
    return "itemSelected-3XxAMf item-3879bf selected-eNoxEK"
  }

  get settingsTabs() {
    return document.querySelector('[class*="layer"] .sidebar .side-2nYO0F')
  }

  injectSettingsTab() {
    if (!this.settingsTabs) return

    const el = this.settingsTabs.querySelector(".socialLinks-1oZoF3")
    if (!el) return

    const header =
      el.previousElementSibling.previousElementSibling.previousElementSibling
        .previousElementSibling.previousElementSibling // divider // logout // divider // changelog // divider

    this.settingsTabs.insertBefore(this.divider, header)
    this.settingsTabs.insertBefore(this.header, header)
    for (const key in this.map) {
      this.settingsTabs.insertBefore(this.map[key].tab, header)
    }
  }

  settingsChanged() {
    //!TODO: instead of forwarding the change, implement settings on commands package please
    const commandsSettings = JSON.parse(
      this.DI.localStorage["DI-commands"] || "{}"
    )
    commandsSettings.commandPrefix = this.settingsTabs.commandPrefix
    this.DI.localStorage.setItem(
      "DI-commands",
      JSON.stringify(commandsSettings)
    )
    this.manager.get("commands").settingsChanged()
  }
}
