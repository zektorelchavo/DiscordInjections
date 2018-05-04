const { Plugin } = require('elements')
const Promise = require('bluebird')

const { MutationObserver } = window

module.exports = class react extends Plugin {
  async preload () {
    this._messageHandler = null
    this.observer = new MutationObserver(mutation => this.onMutate(mutation))

    await this.registerReact()
  }

  // WebPackLoad
  async webPackLoad (cb, name = Math.random().toString()) {
    while (!window.webpackJsonp) {
      await Promise.delay(1)
    }

    return window.webpackJsonp([name], { [name]: cb }, [name])
  }

  async registerReact () {
    let modIdx = 0
    const collectCallbacks = () =>
      this.webPackLoad((_module, _exports, _require) => {
        for (modIdx; modIdx < Object.values(_require.c).length; modIdx++) {
          const modDefinition = _require.c[modIdx]
          if (!modDefinition || !modDefinition.exports) {
            continue
          }
          const mod = modDefinition.exports

          if (
            mod.sendBotMessage ||
            (mod.default && mod.default.sendBotMessage)
          ) {
            this.debug('found messageHandler!')
            this._messageHandler = mod

            Object.keys(this._messageHandler).forEach(k => {
              this.debug(`hiding ${k}`)
              this._messageHandler['$$' + k] = this._messageHandler[k]
              this._messageHandler[k] = (channel, ...args) => {
                this.debug('{handler}', k, channel, ...args)
                return this._messageHandler['$$' + k](channel, ...args)
              }
            })

            return true
          }
        }

        return Promise.delay(1).then(collectCallbacks)
      })

    return collectCallbacks()
  }

  load () {
    // start with a clean setup
    this.observer.disconnect()
    this.observer.observe(document.getElementById('app-mount'), {
      childList: true,
      subtree: true
    })
    this.observer.observe(document.querySelector('html'), {
      attributes: true
    })
  }

  get iconURL () {
    return '//discordinjections.xyz/img/logo.png'
  }

  getReactInstance (node) {
    const key = Object.keys(node).find(key =>
      key.startsWith('__reactInternalInstance')
    )
    return node[key]
  }

  createElement (text) {
    return document.createRange().createContextualFragment(text)
  }

  createModal (content) {
    const root = document.querySelector('#app-mount')

    if (this._modal) this.destroyModal()
    this._modal = this.createElement(`
            <div class="theme-dark DI-modal">
                <div class="callout-backdrop"></div>
                <div class="DI-modal-outer" style="opacity: 1">
                    <div class="DI-modal-inner expanded">
                        <div class="DI-modal-body">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>
        `)

    this._modal
      .querySelector('.DI-modal-inner')
      .addEventListener('click', event => {
        event.stopPropagation()
      })

    let close = this._modal.querySelector('.DI-modal-close-button')
    if (close) close.addEventListener('click', this.destroyModal.bind(this))

    if (!this._hasSetKeyListener) {
      document.body.addEventListener('keyup', this._modalKeypress.bind(this))
      document.body.addEventListener('click', this.destroyModal.bind(this))
      this._hasSetKeyListener = true
    }

    root.appendChild(this._modal)

    this._modal = root.querySelector('.DI-modal')
    const backdrop = this._modal.querySelector('.callout-backdrop')
    setTimeout(() => {
      backdrop.style.opacity = 0.6
    }, 1)
  }

  _modalKeypress (e) {
    if (e.code === 'Escape') this.destroyModal()
  }

  destroyModal () {
    if (this._modal) {
      let backdrop = this._modal.querySelector('.callout-backdrop')
      let inner = this._modal.querySelector('.DI-modal-inner')
      let close = this._modal.querySelector('.DI-modal-close-button')
      backdrop.style.opacity = 0
      inner.classList.remove('expanded')
      setTimeout(() => {
        if (close) close.addEventListener('click', this.destroyModal.bind(this))
        document.body.removeEventListener(
          'keyup',
          this._modalKeypress.bind(this)
        )
        document.body.removeEventListener('click', this.destroyModal.bind(this))
        this._modal.parentNode.removeChild(this._modal)
        this._modal = null
      }, 200)
    }
  }

  get settingsTabs () {
    return {
      'User Settings': 'userSettings',
      'My Account': 'userAccount',
      'Privacy & Safety': 'privacySettings',
      'Authorized Apps': 'authorizedApps',
      Connections: 'connections',
      'Discord Nitro': 'nitro',
      'App Settings': 'appSettings',
      Voice: 'voiceSettings',
      Overlay: 'overlaySettings',
      Notifications: 'notificationSettings',
      Keybindings: 'keybindingSettings',
      Games: 'gameSettings',
      'Text & Images': 'messageSettings',
      Appearance: 'appearanceSettings',
      'Streamer Mode': 'streamerSettings',
      Language: 'languageSettings',
      'Change Log': 'changelog',
      'Log Out': 'logout'
    }
  }

  onMutate (muts) {
    this.emit('mutation', muts)

    // change of language.
    if (
      muts.length === 1 &&
      muts[0].type === 'attributes' &&
      muts[0].attributeName === 'lang'
    ) {
      return this.emit('languageChange', muts[0].target.attributes.lang.value)
    }

    muts.forEach(mut => {
      if (mut.addedNodes.length + mut.removedNodes.length === 0) {
        return
      }

      const changed = (mut.addedNodes.length
        ? mut.addedNodes
        : mut.removedNodes)[0]
      const added = mut.addedNodes.length > 0

      // Settings
      if (changed.classList && changed.matches('[class*=layer]')) {
        const programSettings = !!changed.querySelector(
          '[class*="socialLinks"]'
        )
        if (programSettings && changed.childNodes.length > 0) {
          const child = changed.childNodes[0]
          if (child.className === 'ui-standard-sidebar-view') {
            if (added) {
              this.emit('settingsOpened', mut)
            } else {
              this.emit('settingsClosed', mut)
            }
          }
        }
      } else if (
        added &&
        changed.closest &&
        changed.closest('.content-region')
      ) {
        //! TODO: make this multilingual
        const element = document.querySelector(
          '[class*="layer"] .sidebar [class*="selected"]'
        )
        this.emit(
          'settingsTab',
          this.settingsTabs[element.innerText] || 'unknown',
          mut
        )
      } else if (changed.classList && changed.classList.contains('chat')) {
        // Chat
        if (added) {
          this.emit('chatOpened', mut)
        } else {
          this.emit('chatClosed', mut)
        }
      } else if (
        changed.classList &&
        changed.classList.contains('channelTextArea-1HTP3C') &&
        added
      ) {
        this.emit('channelChanged', mut)
      } else if (changed.id === 'friends') {
        // FriendsList
        if (added) {
          this.emit('friendsListOpened', mut)
        } else {
          this.emit('friendsListClosed', mut)
        }
      } else if (
        added &&
        changed.querySelector &&
        changed.querySelector('.avatar-large + .comment')
      ) {
        // mod the thing
        Array.from(changed.querySelectorAll('.avatar-large')).forEach(ava => {
          const matches = ava.style.backgroundImage.match(/avatars\/(\d+)/)
          if (!matches) {
            return
          }
          const uid = matches[1]
          const name = this.DI.contributors[uid]
          if (!name) {
            return
          }

          const nametag = ava.nextElementSibling.querySelector(
            '.username-wrapper'
          )

          if (nametag) {
            nametag.appendChild(
              this.createElement(
                `<div class="DI-contrib">
                <div class="tooltip tooltip-top tooltip-black">DI Contributor ${name}</div>
              </div>`
              )
            )
          } else {
            this.warn('failed to apply nametag badge', uid, name, nametag)
          }
        })
      }
    })
  }
}
