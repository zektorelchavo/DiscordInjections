const { Plugin } = require('elements')

module.exports = class hooks extends Plugin {
  async preload () {
    this.r = this.manager.get('react')
    this.r.on('mutation', mut => this.onMutation(mut))
  }

  onMutation (muts) {
    muts.forEach(record => {
      if (record.addedNodes.length < 1) {
        return
      }

      const node = record.addedNodes[0]

      // we need a html tag (not a svg one)
      if (!node.classList) {
        return
      }

      if (!node.classList.contains('message-group')) {
        return
      }

      const rInst = this.r.getReactInstance(node)
      const avatar = rInst.memoizedProps.children[0]
      const user = avatar.props.children.props.user

      const name = this.DI.contributors[user.id]
      if (!name) {
        return
      }

      const nametag = node.querySelector('.username-wrapper')

      if (nametag) {
        nametag.appendChild(
          this.r.createElement(
            `<div class="DI-contrib">
                <div class="tooltip tooltip-top tooltip-black">DI Contributor ${name}</div>
              </div>`
          )
        )
      } else {
        this.warn('failed to apply nametag badge', user, name, nametag)
      }
    })
  }

  get iconURL () {
    return '//discordinjections.xyz/img/logo.png'
  }
}
