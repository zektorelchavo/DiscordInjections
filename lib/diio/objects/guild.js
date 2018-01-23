const Base = require("./base")
const Collection = require("../collection")

module.exports = class Guild extends Base {
  constructor(client, guild) {
    super(client, guild)

    this.channels = new Collection(
      this.client,
      require("./channel"),
      guild.channels
    )
    this.channels.found = c => {
      this.client.channels.add(c)
    }
  }
}
