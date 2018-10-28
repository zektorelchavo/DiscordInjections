const { Plugin } = require('elements')
const Promise = require('bluebird')
const { superstruct } = require('superstruct')

const struct = superstruct({
  types: {
    function: v => typeof v === 'function',
    class: v => typeof v === 'function' && v.toString().match(/^class\s*{/i)
  }
})

module.exports = class hooks extends Plugin {
  get guildHandler () {
    return this.fetchModule(require('./guildHandler.json'))
  }

  get loadedModules () {
    if (!this._webpackRequire) {
      return 0
    }

    return Object.keys(this._webpackRequire.c).length
  }

  get modules () {
    if (!this._webpackRequire) {
      return {}
    }

    return this._webpackRequire.c
  }

  async preload () {
    /*    this.messageHandler.then(handler => {
      Object.keys(handler).forEach(k => {
        this.debug(`hiding ${k}`)
        handler['$$' + k] = handler[k]
        handler[k] = (channel, ...args) => {
          this.debug('{handler}', k, channel, ...args)
          return handler['$$' + k](channel, ...args)
        }
      })
    })
    */
    this._fetchWebpackRequire()
  }

  sleep(time = 1000) {
    return new Promise(res => {
      setTimeout(res, time);
    })
  }

  async load () {
    await this.sleep(); // allow for modules to become populated before searching
    this.debug('Getting environment')
    this.environment = await this.fetchModule(
      m => m.Endpoints && m.DownloadLinks
    )

    this.debug('Getting globals')
    this.globals = await this.fetchModule(
      m =>
        m.copy &&
        m.cut &&
        m.paste &&
        m.platform &&
        m.architecture &&
        m.releaseChannel
    )

    this.debug('Getting restClient')
    this.restClient = await this.fetchModule(
      m => m.delete && m.get && m.patch && m.post && m.put && m.getAPIBaseURL
    )

    this.debug('Getting history')
    this.history = await this.fetchModule(
      m => m.getFingerprintLocation && m.transitionToGuild && m.transitionTo
    )

    this.debug('Getting userAgent')
    this.userAgent = await this.fetchModule(
      m => m.description && m.layout && m.ua && m.version
    )

    this.debug('Getting permissionManager')
    this.permissionManager = await this.fetchModule(
      m => m.isRoleHigher && m.can && m.canEveryone && m.areChannelsLocked
    )

    this.debug('Getting assets')
    this.assets = await this.fetchModule(
      m =>
        m.hasAnimatedAvatar &&
        m.getEmojiURL &&
        m.getChannelIconURL &&
        m.getGuildSplashURL
    )

    this.debug('Getting activityManager')
    this.activityManager = await this.fetchModule(
      m =>
        m.canJoinOrSpectate &&
        m.hasRichActivity &&
        m.isGameActivity &&
        m.isOnXbox &&
        m.isStreaming
    )

    this.debug('Getting gameManager')
    this.gameManager = await this.fetchModule(
      m => m.addGame && m.editName && m.getGameNews && m.getGames && m.launch
    )

    this.debug('Getting messageHandler')
    this.messageHandler = await this.fetchModule(
      m =>
        m.receiveMessage &&
        m.updateEditMessage &&
        m.fetchMessages &&
        m.sendBotMessage
    )

    this.debug('Getting groupDM')
    this.groupDM = await this.fetchModule(
      m =>
        m.addRecipient &&
        m.closePrivateChannel &&
        m.openPrivateChannel &&
        m.convertToGuild &&
        m.setName &&
        m.setIcon
    )

    this.debug('Getting channelManager')
    this.channelManager = await this.fetchModule(
      m => m.selectChannel && m.selectPrivateChannel
    )

    this.debug('Getting spotifyActivity')
    this.spotifyActivity = await this.fetchModule(m => m.isSpotifyParty)

    this.debug('Getting user')
    this.user = await this.fetchModule(
      m =>
        m.createGuild &&
        m.createRole &&
        m.nsfwAgree &&
        m.nsfwDisagree &&
        m.selectGuild
    )

    this.debug('Getting messageManager')
    this.messageManager = await this.fetchModule(
      m => m.createBotMessage && m.isMentioned
    )

    this.debug('Getting invites')
    this.invites = await this.fetchModule(m => m.findInvite && m.resolveInvite)

    this.debug('Getting caller')
    this.caller = await this.fetchModule(m => m.call && m.doRing && m.ring)

    this.debug('Getting spotify')
    this.spotify = await this.fetchModule(
      m => m.play && m.fetchIsSpotifyProtocolRegistered
    )

    this.debug('Getting voiceManager')
    this.voiceManager = await this.fetchModule(
      m => m.enable && m.setOutputDevice && m.toggleSelfMute
    )

    this.debug('Getting inviteManager')
    this.inviteManager = await this.fetchModule(
      m => m.acceptInvite && m.resolveInvite
    )
    /*
      Unkown:
        - Last known ID: 106
          deduplicate, getVoiceSettings, hasMessageReadPermission, transformUser, validateSocketClient

        - Last known ID: 222
          can, canManageUser, permissionStoreDidChange
    */
  }

  async _fetchWebpackRequire () {
    while (!window.webpackJsonp) {
      await Promise.delay(1)
    }

    const name = Math.random().toString()
    this._webpackRequire = window.webpackJsonp.push([
      [],
      { [name]: (m, e, r) => (m.exports = r) },
      [[name]]
    ])

    delete this._webpackRequire.m[name]
    delete this._webpackRequire.c[name]
  }

  async fetchModule (cb) {
    return new Promise(async (resolve, reject) => {
      while (!this._webpackRequire) {
        await Promise.delay(1)
      }

      let unsuccessfulIterations = 0
      let lastLength = 0
      let idx = 0

      while (unsuccessfulIterations < 5) {
        if (lastLength < this.loadedModules) {
          const keys = Object.keys(this.modules)

          for (idx; idx < this.loadedModules; idx++) {
            let mod = this.modules[keys[idx]]
            if (!mod || !mod.exports) {
              continue
            }

            mod = mod.exports
            if (cb(mod)) {
              return resolve(mod)
            } else if (mod.default && cb(mod.default)) {
              return resolve(mod.default)
            }
          }
        } else {
          unsuccessfulIterations++

          // force other coroutines to process first
          await Promise.delay(1)
        }

        lastLength = this.loadedModules
      }

      reject(new Error('module not found..!'))
    })
  }

  get iconURL () {
    return '//discordinjections.xyz/img/logo.png'
  }
}
