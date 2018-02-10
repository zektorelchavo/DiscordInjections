const path = require("path")
const fs = require("fs")
const { getCurrentWebContents } = require("electron").remote
const PM = require("./pluginManager")

const conf = fs.existsSync(path.join(__dirname, "..", "config.json"))
  ? require(path.join(__dirname, "..", "config.json"))
  : {}

if (!conf.splash) {
  return
}

const expand = PM.prototype.expand.bind(null)
const splash = expand(conf.splash)
const css = fs.readFileSync(splash, "utf-8")

process.on("loaded", () =>
  getCurrentWebContents().on("dom-ready", () => {
    const style = document.createElement("style")
    style.appendChild(document.createTextNode(css))
    document.body.appendChild(style)
  })
)
