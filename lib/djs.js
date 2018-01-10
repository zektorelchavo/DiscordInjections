/**
 * Bridge Discord's WebSocket to Discord.JS
 * Adapted from GusCaplan's Discord.JS bridge https://github.com/GusCaplan
 * https://github.com/GusCaplan/discord_preload/blob/master/src/DJSBridge.js
 */

const zlib = require('pako')
const Discord = require('discord.js')
require('./DiscordMutator')

Discord.PacketManager = require('discord.js/src/client/websocket/packets/WebSocketPacketManager')
Discord.Websocket = require('discord.js/src/client/websocket/WebSocketConnection')
Discord.Constants = require('discord.js/src/util/Constants')

let erlpack = null

const inflator = new zlib.Inflate({
  chunkSize: 65535,
  flush: zlib.Z_SYNC_FLUSH
})

class BridgedWS {
  constructor (client) {
    this.client = client
    this.packetManager = new Discord.PacketManager(this)
    this.eventMessageBound = this.onMessage.bind(this)

    this.ws = null
    this.disabledEvents = []

    this.connection = {}
    this.sequence = -1
  }

  set (ws) {
    if (this.ws) {
      this.ws.removeEventListener('message', this.eventMessageBound)
      delete this.ws
    }

    this.ws = ws
    ws.addEventListener('message', this.eventMessageBound)

    this.status = Discord.Constants.Status.READY
  }

  onMessage (event) {
    if (!erlpack) erlpack = require('electron').remote.require('discord_erlpack')

    // unpack the data
    // assume every message ends with 0x00, 0x00, 0xff,0xff (zlib suffix)
    const buff = new Uint8Array(event.data)
    inflator.push(buff, true)
    const data = erlpack.unpack(inflator.result)

    this.client.emit('raw', data)
    this.packetManager.handle(data)
  }

  // dummy functions to fool discord.js
  connect () {}
  destroy () {}
  send () {}
  heartbeat () {}

  setSequence (s) {
    this.sequence = s > this.sequence ? s : this.sequence
  }

  _emitReady () {
    this.connection.status = Discord.Constants.Status.READY
    this.client.emit(Discord.Constants.Events.READY)
  }

  checkIfReady () {
    this._emitReady()
  }
}

class BridgedClient extends Discord.Client {
  constructor (options) {
    // prevent discord.js from setting a token
    const odp = Object.defineProperty
    Object.defineProperty = (i, n, d) => {
      if (n === 'token') {
        return
      }

      return odp(i, n, d)
    }
    super(options)
    Object.defineProperty = odp

    this.ws.connection = new BridgedWS(this)

    /*
    let lastpath = window.location.pathname
    this.setInterval(() => {
      if (lastpath === window.location.pathname) return
      this.emit(
        'selectedUpdate',
        {
          guild: this.guilds.get(lastpath.split('/')[2]),
          channel: lastpath.split('/')[3] ? this.channels.get(lastpath.split('/')[3]) : undefined
        },
        {
          guild: this.guilds.get(window.location.pathname.split('/')[2]),
          channel: window.location.pathname.split('/')[3]
            ? this.channels.get(window.location.pathname.split('/')[3])
            : undefined
        }
      )
      lastpath = window.location.pathname
    }, 100)
    */
  }

  get token () {
    try {
      return window.DI.localStorage.getItem('token').replace(/"/g, '')
    } catch (err) {
      return null
    }
  }

  set token (x) {}
}

module.exports = BridgedClient
