const { Plugin } = require('elements')
const Promise = require('bluebird')

module.exports = class hooks extends Plugin {
  get messageHandler () {
    return this.fetchModule(require('./messageHandler.json'))
  }

  async preload () {
    this._hooks = new Map()

    this.messageHandler.then(handler => {
      Object.keys(handler).forEach(k => {
        this.debug(`hiding ${k}`)
        handler['$$' + k] = handler[k]
        handler[k] = (channel, ...args) => {
          this.debug('{handler}', k, channel, ...args)
          return handler['$$' + k](channel, ...args)
        }
      })
    })
  }

  // WebPackLoad
  async webPackLoad (cb, name = Math.random().toString()) {
    while (!window.webpackJsonp) {
      await Promise.delay(1)
    }

    return window.webpackJsonp([name], { [name]: cb }, [name])
  }

  async fetchModule (def) {
    if (this._hooks.has(def.name)) {
      return this._hooks.get(def.name)
    }

    let modIdx = 0
    const findModule = () =>
      this.webPackLoad((_module, _exports, _require) => {
        for (modIdx; modIdx < Object.values(_require.c).length; modIdx++) {
          // ignore failed modules
          const modDefinition = _require.c[modIdx]
          if (!modDefinition || !modDefinition.exports) {
            continue
          }

          // we are only interested in the exports, ignore the metadata
          const mod = modDefinition.exports

          if (
            def.hooks.every(endpoint => {
              let node = mod[endpoint]
              if (!node && mod.default) {
                node = mod.default[endpoint]
              }
              if (!node) {
                return false
              }

              if (endpoint.type) {
                return typeof node === endpoint.type
              }

              return true
            })
          ) {
            this._hooks.set(def.name, mod)
            return mod
          }
        }

        return Promise.delay(1).then(findModule)
      })

    return findModule()
  }

  get iconURL () {
    return '//discordinjections.xyz/img/logo.png'
  }
}
