const Discord = require('discord.js')

module.exports = DI => {
  Object.defineProperty(Discord.Client.prototype, 'selectedGuild', {
    get: () => this.guilds.get(window.location.pathname.split('/')[2])
  })

  Object.defineProperty(Discord.Client.prototype, 'selectedChannel', {
    get: () =>
      window.location.pathname.split('/')[3]
        ? this.channels.get(window.location.pathname.split('/')[3])
        : null
  })

  Object.defineProperty(Discord.Guild.prototype, 'element', {
    get: () => document.querySelector(`a[href*="${this.id}"]`).closest('.guild')
  })

  Object.defineProperty(Discord.Guild.prototype, 'selected', {
    get: () => this.element && this.element.className.includes('selected')
  })

  Object.defineProperty(Discord.DMChannel.prototype, 'element', {
    get: () =>
      document.querySelector(`a[href="/channels/@me/${this.id}"]`)
        ? document
            .querySelector(`a[href="/channels/@me/${this.id}"]`)
            .closest('.channel')
        : null
  })

  Object.defineProperty(Discord.DMChannel.prototype, 'selected', {
    get: () => this.element && this.element.className.includes('selected')
  })

  Object.defineProperty(Discord.GroupDMChannel.prototype, 'element', {
    get: () =>
      document.querySelector(`a[href="/channels/@me/${this.id}"]`)
        ? document
            .querySelector(`a[href="/channels/@me/${this.id}"]`)
            .closest('.channel')
        : null
  })

  Object.defineProperty(Discord.GroupDMChannel.prototype, 'selected', {
    get: () => this.element && this.element.className.includes('selected')
  })

  Object.defineProperty(Discord.TextChannel.prototype, 'visible', {
    get: () => this.permissionsFor(this.client.user).has('READ_MESSAGES')
  })

  Object.defineProperty(Discord.TextChannel.prototype, 'unread', {
    get: () => {
      if (!this.element) return -1
      const r = DI.plugins.get('react').getReactInstance(this.element)
      return r.memoizedProps.children.props.unread
    }
  })

  Object.defineProperty(Discord.GuildChannel.prototype, 'element', {
    get: () => {
      const channels = document.querySelectorAll(
        '.channels-3g2vYe .scroller-fzNley .containerDefault-7RImuF'
      )
      for (const channel of channels) {
        const r = DI.plugins.get('react').getReactInstance(channel)
        if (!r) continue
        if (r.memoizedProps.children[0]) {
          if (r.memoizedProps.children[0].props.channel.id === this.id) {
            return channel
          }
        } else {
          if (r.memoizedProps.children.props.channel.id === this.id) {
            return channel
          }
        }
      }
      return null
    }
  })

  Object.defineProperty(Discord.Message.prototype, 'element', {
    get: () => {
      const messages = document.querySelectorAll('.message')
      for (const message of messages) {
        const react = DI.plugins.get('react').getReactInstance(message)
        if (!react) continue
        let id = message.parentNode.parentNode.classList.contains('compact')
          ? react.memoizedProps.children[0].props.children[1].props.subscribeTo.split(
              '_'
            )[3]
          : react.memoizedProps.children[0].props.children[1].props.children[1].props.subscribeTo.split(
              '_'
            )[3]
        if (id === this.id) return message
      }
      return null
    }
  })

  const client = new Discord.Client()
  client.login(JSON.parse(DI.localStorage.token))
  return client
}
