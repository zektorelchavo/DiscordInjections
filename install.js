const util = require("./lib/util")
const path = require("path")
const fs = require("fs-extra")
const { spawn } = require("child_process")

const packageTemplate = {
  name: "discordinjections-loader",
  version: "1.0.0",
  description:
    "Injects CSS and JS into the discord client, and piggybacks the websocket for later use.",
  main: "index.js",
  scripts: {},
  author: "Kura & stupid cat",
  license: "MIT",
  repository: "https://github.com/DiscordInjections/DiscordInjections",
  dependencies: {}
}

const indexTemplate = basePath =>
  `require('${basePath.replace(/\\/g, "/")}').inject(__dirname)`

function launchClient(exe) {
  // start application detached from main process, ignore any stdio and unref
  spawn(exe, { detached: true, stdio: "ignore" }).unref()
}

async function closeClient(proc) {
  if (proc.pid.length === 0) return true
  for (let pid of proc.pid) {
    // dont try..catch, let exceptions fall through
    process.kill(pid)
  }
}

function injectClient(base) {
  const app =
    process.platform === "darwin"
      ? path.join(base, "..", "Resources", "app")
      : path.join(base, "app")
  if (fs.existsSync(path.join(app, "package.json"))) {
    throw new Error(`some kind of injector is already installed in <${app}>`)
  }

  fs.ensureDirSync(app)

  // create required injector files
  fs.writeFileSync(
    path.join(app, "package.json"),
    JSON.stringify(packageTemplate, null, 2)
  )
  fs.writeFileSync(path.join(app, "index.js"), indexTemplate(__dirname))
}

async function inject(proc, reinstall = false) {
  const appPath = path.join(proc.command, "..", "resources")

  if (proc.pid.length > 0 && !reinstall) {
    console.log("closing client...")
    await closeClient(proc)
  }

  console.log("creating injector...")
  await injectClient(appPath)

  if (proc.pid.length > 0) {
    console.log("restarting client...")
    await launchClient(proc.command)
  }

  console.log("installed di successfully")
}

async function uninject(proc, reinstall = false) {
  const appPath =
    process.platform === "darwin"
      ? path.join(proc.command, "..", "..", "Resources", "app")
      : path.join(proc.command, "..", "resources", "app")

  if (proc.pid.length > 0) {
    console.log("closing client...")
    await closeClient(proc)
  }

  console.log("purging injector...")
  await fs.removeSync(appPath)

  if (proc.pid.length > 0 && !reinstall) {
    console.log("restarting client...")
    await launchClient(proc.command)
  }

  console.log("uninstalled di successfully")
}

async function main(args) {
  const interactive = !args.includes("-s")
  const procs = await util.getDiscordProcess()
  let p

  switch (Object.values(procs).length) {
    case 1:
      p = Object.values(procs).shift()
      break

    // no processes found, fall back to manual mode
    case 0:
      if (!interactive) throw new Error("no discord process found")
      p = {
        command: await util.readString(
          "Enter the path to the discord executeable: "
        ),
        pid: []
      }

    default:
      if (!interactive) throw new Error("to many discord processes found")

      let question = `Please choose your process from the list:`
      const keys = Object.keys(procs)
      for (let i = 0; i < keys.length; i++) {
        question += `\n${i}. ${keys[i]} (${procs[keys[i]].pid.join(", ")})`
      }

      const id = await util.readMultipleChoice(
        "Please choose your process from the list:\n" +
          Object.values(procs)
            .map(
              (p, idx) => `  [${idx + 1}] ${p.command} (${p.pid.join(", ")})`
            )
            .join("\n"),
        Object.values(procs).map((_, idx) => `${idx + 1}`)
      )
      p = Object.values(procs)[id - 1]
  }

  switch (args[2]) {
    case "inject":
      await inject(p)
      break
    case "uninject":
      await uninject(p)
      break
    case "reinject":
      await uninject(p, true)
      await inject(p, true)
      break

    default:
      console.error(
        "Invalid command, valid commands are: inject, uninject, reinject"
      )
      return 1
  }
}
main(process.argv).then(errCode => process.exit(errCode)).catch(err => {
  console.error(err)
  process.exit(128)
})
