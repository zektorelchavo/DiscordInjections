const EventEmitter = require("eventemitter3")
const zlib = require("pako")
const path = require("path")
const Promise = require("bluebird")

const EP = require("./endpoints")

// discord erlpack loves to fiddle with the global object it seems. so to counter this, we run erlpack in the electron master process, instead of the web renderer process
const erlpack = require("electron").remote.require(
  path.join(__dirname, "erlpack.js")
)

module.exports = class DiscordClient extends EventEmitter {
  constructor(DI) {
    super()
    this.DI = DI
  }

  onHandleWSClose(code, data) {
    // reset runtime state
    this._ready = false
    this._ws = null

    // fire disconnect event
    this.emit("disconnect")
  }

  async onHandleWSMessage(ev) {
    const message = await this._decompressWSMessage(ev.data)

    if (message.op === 0) {
      this._sequence = message.s
    }

    this.emit("raw", message)

    switch (message.t) {
      case "READY":
        this._user = message.d.user
        this._guilds = message.d.guilds
        this._notes = message.d.notes
        this._presences = message.d.presences
        this._privateChannels = message.d.private_channels
        this._relationships = message.d.relationships
        this._sessionID = message.d.session_id
        this._userGuildSettings = message.d.user_guild_settings
        this._userSettings = message.d.user_settings
        this._v = message.d.v
        break

      default:
        console.debug("[DIIO] unhandled event", message.t, message.d)
    }

    return this.emit(message.t, message.d)
  }

  _decompressWSMessage(data) {
    // assume every message ends with 0x00, 0x00, 0xff,0xff (zlib suffix)
    const buff = new Uint8Array(data)
    this._inflator.push(buff, zlib.Z_SYNC_FLUSH)
    return erlpack.unpack(this._inflator.result)
  }

  connect(ws) {
    this._ws = ws
    this._inflator = new zlib.Inflate({
      chunkSize: 65535,
      flush: zlib.Z_SYNC_FLUSH
    })

    this.privateChannels = new Map()
    this.privateGroupChannels = new Map()
    this.users = new Map()
    this.guilds = new Map()
    this.channels = new Map()

    this._ws.addEventListener("close", ev => this.onHandleWSClose(ev))
    this._ws.addEventListener("error", ev => this.onHandleWSClose(ev))
    this._ws.addEventListener("message", ev => this.onHandleWSMessage(ev))
  }

  request(method, url) {
    const headers = {
      Accept: "*/*",
      "Accept-Language": "en-US;q=0.8",
      DNT: 1,
      Authorization: JSON.parse(this.DI.localStorage["token"]),
      "Content-Type": "application/json; charset=utf-8" // TODO: support multitype
    }

    return window
      .fetch({
        method,
        url,
        headers
      })
      .then(res => {
        if (res.status === 429) {
          return res
            .json()
            .then(json => json.retry_after)
            .then(delay => Promise.delay(delay))
            .then(() => this.request(method, url))
        }
        if ((res.status / 100) | (0 !== 2)) {
          throw new Error("vailed to parse response")
        }

        // TODO: support multitype
        return res.json()
      })
  }

  get selectedGuild() {
    return this._guilds.find(
      g => g.id == window.location.pathname.split("/")[2]
    )
  }

  get selectedChannel() {
    const g = this.selectedGuild
    if (!g) {
      return this._privateChannels.find(
        c => c.id == window.location.pathname.split("/")[3]
      )
    }
    return g.channels.find(c => c.id == window.location.pathname.split("/")[3])
  }

  sendMessage(message, embed, channel) {
    if (typeof message !== "string") {
      channel = embed
      embed = message
      message = null
    }

    if (channel == null) {
      channel = embed
      embed = {}
    }

    const msg = {
      content: message,
      nonce: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      embed
    }

    const cid = this.resolveID(channel)
    return this.request("post", EP.Messages(cid), msg)
  }

  async openDMChannel(uid) {
    if (this.users.has(uid) && this.users.get(uid).dm) {
      return this.privateChannels.get(this.users.get(uid).dm)
    }

    if (!this.users.has(uid)) {
      // make sure there is a user object in reach
    }

    const res = await this.request("post", EP.UserChannels(this._user.id), {
      recipient_id: uid
    })

    console.debug("[DIIO] createDM", res)
    // save user object (isnt discord gonna throw an event for dat?)
    this.users.get(id).dm = res.id
    return res.id
  }

  async resolveID(id) {
    if (typeof id !== "string") {
      if (!id.id) {
        throw new Error("id unresolvable")
      }

      id = id.id
    }

    // search through private channels
    if (this.privateChannels.has(id)) {
      return id
    }

    if (this.privateGroupChannels.has(id)) {
      return id
    }

    let target = this._privateChannels.find(c => c.id === id)
    if (target) {
      if (target.recipients.length > 1) {
        this.privateGroupChannels.set(id, target)
      } else {
        this.privateChannels.set(id, target)
      }

      return target.id
    }

    // search through users
    if (this.users.has(id) && this.users.get(id).dm) {
      return this.users.get(id).dm
    }

    // - existing private channels
    target = this._privateChannels.find(
      c => c.recipients.length === 1 && c.recipients[0].id === id
    )
    if (target) {
      this.privateChannels.set(target.id, target)
      this.users.set(id, target.recipients[0])
      this.users.get(id).dm = target.id

      return target.id
    }

    // - user object without a dm
    if (this.users.has(id)) {
      return this.openDMChannel(id).id
    }

    // check if we got a matching channel
    if (this.channels.has(id)) {
      return id
    }

    target = this._guilds.find(g => {
      return g.channels.find(c => c.id === id).map(c => (c.guild_id = g.id))
    })

    if (target) {
      this.channels.set(id, target)
      if (!this.guilds.has(target.guild_id)) {
        this.guilds.set(
          target.guild_id,
          this._guilds.find(g => g.id === target.guild_id)
        )
      }
      return target.id
    } else {
      return new Error("could not resolve id")
    }
  }
}
