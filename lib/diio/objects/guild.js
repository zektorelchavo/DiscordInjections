const Base = require("./base")
const Collection = require("../collection")

module.exports = class Guild extends Base {
  constructor(client, guild) {
    super(client, guild)

    this.channels = new Collection(
      this.client,
      require("./channel"),
      guild.channels,
      {
        onFound: c => {
          this.client.channels.add(c)
        }
      }
    )

    this.members = new Collection(
      this.client,
      require("./member"),
      guild.members,
      {
        selector: r => r.user.id,
        onFound: m => {
          this.client.users.add(m.user)
        }
      }
    )
  }
}
