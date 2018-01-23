const Plugin = module.parent.require("../components/plugin")
const postcss = require("postcss")
const postcssImport = require("postcss-import")
const fs = require("fs-extra")
const path = require("path")
const Watcher = module.parent.require("../lib/watcher")

module.exports = class react extends Plugin {
  preload() {
    this.convertLegacySettings()

    this.postcss = postcss([postcssImport])
    this.watcher = new Watcher()
    this.watcher.on("change", (fileName, identifier) =>
      this.onFileChange(identifier, fileName)
    )

    this.cssStack = {}
    this.manager.on("plugins-preloaded", plugins => {
      plugins.map(plugin => this.manager.get(plugin, true)).forEach(plugin => {
        const name = plugin.package.name
        const css = plugin.package.css || []
        if (!css.length) {
          return this.log(name, "did not specify any css files, skipping")
        } else {
          this.cssStack[name] = {
            path: plugin.path,
            files: css
          }
          return this.log(name, "requested", css.length, "css files to attach")
        }
      })
    })

    this.manager.on("load", plugin =>
      this.loadPluginCss(this.manager.get(plugin, true))
    )
    this.manager.on("unload", plugin =>
      this.unloadPluginCss(this.manager.get(plugin, true))
    )
  }

  load() {
    Object.keys(this.cssStack).forEach(plugin => {
      this.cssStack[plugin].files.forEach(async fileName => {
        const filePath = path.resolve(this.cssStack[plugin].path, fileName)
        let content = await fs.readFile(filePath, "utf-8")
        content = await this.postcss.process(content, {
          from: filePath,
          to: filePath,
          map: { annotation: false, inline: false, safe: false }
        })
        this.log(`attaching [${plugin}:${fileName}]`)
        document.body.appendChild(this._createStyle(content, plugin, fileName))
      })
    })

    this.getSettingsNode("stylesheets", []).forEach(async fileName => {
      const filePath = path.resolve(
        this.manager.expand(this.DI.conf.cssPath || "./CSS"),
        fileName
      )
      let content = await fs.readFile(filePath, "utf-8")
      content = await this.postcss.process(content, {
        from: filePath,
        to: filePath,
        map: { annotation: false, inline: false, safe: false }
      })
      this.log(`attaching userstyle [${fileName}]`)
      document.body.appendChild(
        this._createStyle(content, "$userstyle$", fileName)
      )
      this.watcher.addFile(filePath, fileName)
    })
  }

  unload() {}

  convertLegacySettings() {
    if (this.hasLegacySettings) {
      const legacySettings = this.legacySettings
      if (legacySettings.cssPath) {
        // force overwrite everything!
        const css = legacySettings.cssPath
        this.settings = { stylesheets: [css] }

        delete legacySettings.cssPath
        this.DI.localStorage.setItem(
          "DI-DiscordInjections",
          JSON.stringify(legacySettings)
        )
      }
    }
  }

  get legacySettings() {
    const dinode = this.DI.localStorage.getItem("DI-DiscordInjections")
    try {
      return JSON.parse(dinode)
    } catch (ex) {
      return {}
    }
  }

  get hasLegacySettings() {
    return this.DI.localStorage.getItem("DI-DiscordInjections") !== null
  }

  _createStyle(content, plugin, filename) {
    const style = document.createElement("style")
    style.dataset.plugin = plugin
    style.dataset.filename = filename
    style.appendChild(document.createTextNode(content))
    return style
  }

  loadPluginCss(plugin) {
    const name = plugin.package.name
    const css = plugin.package.css || []
    if (!css.length) {
      return this.log(name, "did not specify any css files, skipping")
    } else {
      css.forEach(async fileName => {
        const filePath = path.resolve(plugin.path, fileName)
        let content = await fs.readFile(filePath, "utf-8")
        content = await this.postcss.process(content, {
          from: filePath,
          to: filePath,
          map: { annotation: false, inline: false, safe: false }
        })
        this.log(`attaching [${plugin.package.name}:${fileName}]`)
        document.body.appendChild(
          this._createStyle(content, plugin.package.name, fileName)
        )
      })
    }
  }

  unloadPluginCss(plugin) {
    Array.from(
      document.querySelectorAll(`style[data-plugin="${plugin.package.name}"]`)
    ).forEach(tag => tag.parentElement.removeChild(tag))
  }

  async onFileChange(fileName, filePath) {
    let content = await fs.readFile(filePath, "utf-8")
    content = await this.postcss.process(content, {
      from: filePath,
      to: filePath,
      map: { annotation: false, inline: false, safe: false }
    })

    this.log(`attaching userstyle [${fileName}]`)
    const el = document.body.querySelector(
      `style[data-plugin="$userstyle$"][data-filename="${fileName}"]`
    )
    if (!el) {
      // huh? weird. just add it to the dom then
      document.body.appendChild(
        this._createStyle(content, "$userstyle$", fileName)
      )
    } else {
      while (el.firstChild) el.removeChild(el.firstChild)
      el.appendChild(document.createTextNode(content))
    }
  }
}
