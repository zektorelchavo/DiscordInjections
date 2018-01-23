const EventEmitter = require("eventemitter3")

module.exports = class Base extends EventEmitter {
  constructor(client, o) {
    super()

    this.client = client

    Object.keys(o).forEach(k => {
      const normalized = k.replace(/_+([a-z0-9])/gi, m => m[1].toUpperCase())
      if (o.hasOwnProperty(k)) {
        this[normalized] = o[k]
      }
    })
  }
}
