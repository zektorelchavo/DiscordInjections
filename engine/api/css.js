const fs = require('fs-extra')
const path = require('path')
const glob = require('globby')
const elements = require('../../elements')
const Base = require('./base')

class Provider extends Base {
  static supports (pluginPath) {
    if (!fs.existsSync(pluginPath)) {
      return false
    }

    // FIXME: try to parse with postcss instead?
    return path.extname(pluginPath) === '.css'
  }

  static resolve (id, pluginPaths) {
    console.debug(
      `[engine/api/css] resolving <${id}> from ${JSON.stringify(pluginPaths)}`
    )

    for (let pp of pluginPaths) {
      const packages = glob.sync(`**/${id}.css`, {
        cwd: pp,
        absolute: true
      })

      return packages[0]
    }

    throw new Error(`[engine/api/css] could not resolve <${id}>`)
  }

  get Class () {
    return elements.Theme
  }

  get id () {
    return `CSS#${path.basename(this.path, path.extname(this.path))}`
  }

  use () {
    if (!this.injected) {
      this.inject()
    }
  }

  async load (force = false, dependency = null) {
    this.inject()
  }

  async inject () {
    const content = await fs.readFile(this.path, 'utf-8')
    this._css = await this.DI.postcss.process(content, {
      from: this.path,
      to: this.path,
      map: {
        annotation: false,
        inline: false,
        safe: false
      }
    })

    let el = document.querySelector(`style[data-plugin-css="${this.id}"]`)
    if (!el) {
      console.info('[engine/api/css] attaching css file', this.path)
      document.body.appendChild(this._createStyle(this._css, this.id))
    } else {
      console.info('[engine/api/css] updating css file', this.path)
      while (el.firstChild) {
        el.firstChild.remove()
      }
      el.appendChild(document.createTextNode(this._css))
    }

    if (!this.watcher) {
      this.watcher = fs.watch(this.path, 'utf-8', type => {
        this.inject()
      })
    }
  }

  _createStyle (content, plugin) {
    const style = document.createElement('style')
    style.dataset.pluginCss = plugin
    style.appendChild(document.createTextNode(content))
    return style
  }
}

module.exports = Provider
