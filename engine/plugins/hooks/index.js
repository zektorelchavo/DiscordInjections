const { Plugin } = require('elements')
const Promise = require('bluebird')

module.exports = class hooks extends Plugin {
  get messageHandler () {
    return this.fetchModule(require('./messageHandler.json'))
  }

  get guildHandler () {
    return this.fetchModule(require('./guildHandler.json'))
  }

  async preload () {
    this._hooks = new Map()

    this._require = null
    this.webPackLoadQueue = []

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

    this._moduleList = {}
    this._indexed = -1
  }

  // WebPackLoad
  async webPackLoad (cb, name = Math.random().toString()) {
    while (!window.webpackJsonp) {
      await Promise.delay(1)
    }

    // newstyle webpack
    if (window.webpackJsonp.push) {
      // overload undefined
      if (!window.webpackJsonp._push) {
        window.webpackJsonp._push = window.webpackJsonp.push

        // overwrite webpack jsonp push
        window.webpackJsonp.push = jsonp => {
          // is _require unset?
          if (this._require === null) {
            // grab the first element in the module cache
            const callID = Object.keys(jsonp[1])[0]
            const call = jsonp[1][callID]

            // attach custom logic to module
            jsonp[1][callID] = (_module, _exports, _require) => {
              this.debug('stealing require reference')
              this._require = _require
              this.processWPLQueue()

              return call(_module, _exports, _require)
            }
          }
          return window.webpackJsonp._push(jsonp)
        } // fn push
      } // !_push

      return this.processWPLQueue(cb)
    } else {
      return window.webpackJsonp([name], { [name]: cb }, [name])
    }
  }

  processWPLQueue (newCallback = null) {
    if (newCallback) {
      this.debug('Adding new hook callback')
      this.webPackLoadQueue.push(newCallback)
    }

    if (this._require) {
      // dont lock up current callback pls :)
      setImmediate(() => {
        this.debug('draining hook callbacks')
        while (this.webPackLoadQueue.length > 0) {
          const cb = this.webPackLoadQueue.shift()
          cb(null, {}, this._require)
        }
      })
    }
  }

  async fetchModule (def) {
    if (this._hooks.has(def.name)) {
      return this._hooks.get(def.name)
    }

    return new Promise(resolve => {
      let modIdx = 0
      const findModule = () =>
        this.webPackLoad((_module, _exports, _require) => {
          this.debug('Searching module...', def.name, modIdx)
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
                let node = mod[endpoint.name]
                if (!node && mod.default) {
                  node = mod.default[endpoint.name]
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
              this.debug('Found module!', def.name)
              this._hooks.set(def.name, mod)
              return resolve(mod)
            }
          }

          this.debug('...fill buffer', def.name)
          return Promise.delay(1).then(findModule)
        })
      return findModule()
    })
  }

  get iconURL () {
    return '//discordinjections.xyz/img/logo.png'
  }
}
