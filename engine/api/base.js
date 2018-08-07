class Base {
  static supports (path) {
    throw new Error('not implemented')
  }

  static resolve (id, pluginPaths) {
    throw new Error('not implemented')
  }

  constructor (pluginPath) {
    this.path = pluginPath
    this.loadedBy = new Set()
  }

  get Class () {
    throw new Error('not implemented')
  }

  get id () {
    throw new Error('not implemented')
  }

  use () {
    throw new Error('not implemented')
  }

  connect (DI) {
    this.DI = DI
  }

  load (force = false, dependency = null) {
    throw new Error('not implemented')
  }
}

module.exports = Base
