const Plugin = module.parent.require("../components/plugin")

//!TODO: custom settings page
// => ability to hide commands
// => ability to rename commands?

module.exports = class commands extends Plugin {
  preload() {
    this.convertLegacySettings()
    this.settings = Object.assign({}, { commandPrefix: "//" }, this.settings)
    this.acRows = []
    this.currentSet = []
    this.offset = 0

    this.commands = {}
    this.commandElements = {}

    this.manager.on("unload", plugin => {
      Object.keys(this.commands)
        .map(name => this.commands[name])
        .filter(cmd => cmd.plugin._name === plugin)
        .forEach(cmd => this.unhookCommand(cmd.name))
    })
  }

  load() {
    document.addEventListener("input", (...args) => this.onInput(...args))
    document.addEventListener("keydown", (...args) => this.onKeyDown(...args))
  }

  convertLegacySettings() {
    if (this.hasLegacySettings) {
      const legacySettings = this.legacySettings
      if (legacySettings.commandPrefix) {
        // force overwrite everything!
        const commandPrefix = legacySettings.commandPrefix
        this.settings = { commandPrefix }

        delete legacySettings.commandPrefix
        this.DI.localStorage.setItem(
          "DI-DiscordInjections",
          JSON.stringify(legacySettings)
        )
      }
    }
  }

  get legacySettings() {
    const dinode = this.DI.localStorage.getItem("DI-DiscordInjections")
    try {
      return JSON.parse(dinode)
    } catch (ex) {
      return {}
    }
  }

  get hasLegacySettings() {
    return this.DI.localStorage.getItem("DI-DiscordInjections") !== null
  }

  get textarea() {
    return document.querySelector(".chat .content textarea")
  }

  get autoComplete() {
    return document.querySelector(".di-autocomplete")
  }

  get selectedIndex() {
    if (this.lastHovered == null || this.acRows.length === 0) return null
    let index = 0
    for (const { selector } of this.acRows) {
      if (this.lastHovered === selector) return index
      index++
    }
  }

  get selectedClass() {
    return "selectorSelected-2M0IGv"
  }

  onInput(ev) {
    const textarea = this.textarea
    if (
      !textarea ||
      textarea !== document.activeElement ||
      !textarea.value.startsWith(this.settings.commandPrefix)
    ) {
      if (this.autoComplete) this.removeAC()
      return
    }

    let ac = this.autoComplete
    let content = textarea.value.toLowerCase()

    if (content.includes(" ")) {
      return this.removeAC()
    }

    if (!ac && !content.includes(" ")) {
      ac = this.initAC()
    }

    if (content.trim() === this.settings.commandPrefix) {
      this.offset = 0
      this.currentSet = Object.keys(this.commands)
      this.populateCommands()
    } else {
      content = content.substring(this.settings.commandPrefix.length).trim()
      let [command, ...others] = content.split(" ")
      this.currentSet = Object.keys(this.commands).filter(k =>
        k.includes(command)
      )
      if (this.currentSet.length === 0) {
        return this.removeAC()
      }
      let exact = this.currentSet.find(k => k === command)
      if (exact && others.length > 0) {
        this.currentSet = [exact]
      } else {
        this.currentSet.sort((a, b) => {
          let score = 0
          if (command === a) score += 100
          if (command === b) score -= 100
          if (a.startsWith(command)) score += 10
          if (b.startsWith(command)) score -= 10
          score += a < b ? 1 : -1
          return -score
        })
      }
      this.offset = 0
      this.populateCommands()
    }
  }

  async onKeyDown(event) {
    if (
      !this.textarea ||
      (event.target === this.textarea &&
        event.key === "Enter" &&
        this.textarea.value === "")
    ) {
      return
    }

    if (
      this.textarea.value.toLowerCase().startsWith(this.settings.commandPrefix)
    )
      switch (event.key) {
        case "ArrowUp":
          if (this.acRows.length > 0) {
            this.populateCommands(true, true)
            event.preventDefault()
          }
          break
        case "ArrowDown":
          if (this.acRows.length > 0) {
            this.populateCommands(true, false)
            event.preventDefault()
          }
          break
        case "Tab":
          if (this.lastHovered) {
            this.lastHovered.click()
            event.preventDefault()
          }
          break
        case "Enter": {
          if (event.shiftKey) return
          let command = this.textarea.value
          command = command.substring(this.settings.commandPrefix.length).trim()
          let [name, ...args] = command.split(" ")
          name = name.toLowerCase()

          if (this.commands[name]) {
            this.onInput()
            event.preventDefault()
            let output = await Promise.resolve(
              this.commands[name]._execute(args)
            )
            if (output) {
              this.DI.client.selectedChannel.send(
                output,
                this.DI.client.selectedChannel
              )
            }

            setTimeout(() => this.writeMessage(), 200)
          } else if (this.lastHovered) {
            this.lastHovered.click()
            event.preventDefault()
          }
        }
      }
  }

  onHover(element) {
    for (const elem of this.acRows) {
      elem.selector.classList.remove(this.selectedClass)
    }
    element.classList.add(this.selectedClass)
    this.lastHovered = element
  }

  initAC() {
    const elem = document.querySelector("form textarea")
    if (elem) {
      let element = this.manager.get("react")
        .createElement(`<div class="autocomplete-1TnWNR autocomplete-1LLKUa di-autocomplete">
            <div class="autocompleteRowVertical-3_UxVA autocompleteRow-31UJBI header">
            <div class="selector-nbyEfM" style="display: flex;"><div class="di-autocomplete-header-label contentTitle-sL6DrN primary400-1OkqpL weightBold-2qbcng">
            DiscordInjections Commands</div><div style="flex: 1 1;" class="di-autocomplete-header-label contentTitle-sL6DrN di-autocomplete-commandinfo primary400-1OkqpL weightBold-2qbcng">
            PREFIX: ${this.settings.commandPrefix}</div></div></div></div>`)
      elem.parentElement.insertBefore(element, elem.nextSibling)
      this.autoComplete.addEventListener("click", ev => {
        const el = ev.target.closest("[data-command]")
        if (!el) return
        const ta = this.textarea
        if (ta) {
          const components = ta.value.split(" ")
          if (components.length > 1) {
            components[0] = this.settings.commandPrefix + el.dataset.command
          } else {
            components.shift()
            components.push(this.settings.commandPrefix + el.dataset.command)
          }
          this.writeMessage(components.join(" ") + " ")

          this.onInput()
        }
      })
      this.autoComplete.addEventListener("mouseover", ev => {
        const el = ev.target.closest("[data-command]")
        if (!el) return
        this.onHover(el)
      })
    }

    return this.autoComplete
  }

  writeMessage(content = "", focus = true) {
    if (focus) {
      this.textarea.focus()
    }

    this.textarea.textContent = content
    this.textarea.value = content

    // first, lets clear the full text area
    this.textarea.selectionStart = this.textarea.value.length
    this.textarea.selectionEnd = this.textarea.value.length

    this.textarea.dispatchEvent(new Event("input"), {
      bubbles: true,
      cancelable: true
    })
    this.textarea.dispatchEvent(new Event("keydown"), {
      bubbles: true,
      cancelable: true
    })
    this.textarea.dispatchEvent(new Event("keypress"), {
      bubbles: true,
      cancelable: true
    })
    this.textarea.dispatchEvent(new Event("keyup"), {
      bubbles: true,
      cancelable: true
    })
  }

  removeAC() {
    const ac = this.autoComplete
    if (ac) {
      ac.remove()
      this.acRows = []
      this.lastHovered = null
    }
  }

  createCommandRow(command) {
    const h2rgb = hex => {
      var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
          ]
        : [0, 0, 0]
    }

    const isDark = c =>
      c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114 > 150 ? false : true

    const color =
      typeof command.plugin.color === "number"
        ? command.plugin.color.toString(16)
        : command.plugin.color

    return this.manager.get("react")
      .createElement(`<div class="autocompleteRowVertical-3_UxVA autocompleteRow-31UJBI command">
        <div class="selector-nbyEfM selectable-3iSmAf" data-command="${command.name}">
          <div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO content-249Pr9"
          style="flex: 1 1 auto;">
            <img class="icon-3XfMwL" src="https://discordinjections.xyz/img/logo-alt-nobg.svg">
            <div class="marginLeft4-3RAvyQ">${command.name}</div>
            <div class="marginLeft4-3RAvyQ primary400-1OkqpL">${command.usage ||
              ""}</div>
            <div class="ellipsis-1MzbWB primary400-1OkqpL di-autocomplete-commandinfo" style="flex: 1 1 auto";>
              <span class='command-plugin-tag${isDark(h2rgb(color))
                ? " dark"
                : ""}'
              style="color: #${color}; border-color: #${command.plugin.color};">
                ${command.plugin._name}
              </span> - ${command.info}
            </div>
          </div>
        </div>
      </div>`).firstElementChild
  }

  attachCommandRow(name) {
    if (!this.autoComplete) this.initAC()

    const node = this.commandElements[name]

    this.acRows.push({
      name,
      info: this.commands[name].info,
      usage: this.commands[name].usage,
      selector: node.childNodes[1],
      element: node
    })

    this.autoComplete.appendChild(node)
  }

  hookCommand(command) {
    if (this.commands[command.name])
      throw new Error(`A command with the name ${command.name} already exists!`)

    this.commands[command.name] = command
    this.commandElements[command.name] = this.createCommandRow(command)
    this.log(
      `Loaded command '${command.name}' from plugin ${command.plugin._name}.`
    )
  }

  unhookCommand(name) {
    if (this.commands[name]) {
      const command = this.commands[name]
      delete this.commands[name]
      delete this.commandElements[name]
      this.log(
        `Unloaded command '${command.name}' from plugin ${command.plugin._name}`
      )
    }
  }

  populateCommands(move = false, up = true) {
    let keys = this.currentSet

    if (this.acRows.length === 0) {
      let selection = keys.slice(0, 10)
      this.removeAC()
      this.initAC()

      for (const command of selection) {
        this.attachCommandRow(command)
      }

      if (this.acRows.length > 0) this.onHover(this.acRows[0].selector)
      return
    }

    let selectedIndex = this.selectedIndex
    if (this.currentSet.length >= 10) {
      if (this.offset < 0) {
        this.offset = this.currentSet.length - 10
        selectedIndex = 9
      }
      if (this.offset >= this.currentSet.length - 9) {
        this.offset = 0
        selectedIndex = 0
      }
    } else this.offset = 0

    if (move) {
      if (up) {
        selectedIndex--
        if (selectedIndex < 0) {
          if (this.currentSet.length < 10) {
            selectedIndex = this.currentSet.length - 1
          } else {
            this.offset--
            return this.populateCommands()
          }
        }
        return this.onHover(this.acRows[selectedIndex].selector)
      } else {
        selectedIndex++
        if (selectedIndex >= Math.min(10, this.currentSet.length)) {
          if (this.currentSet.length < 10) {
            selectedIndex = 0
          } else {
            this.offset++
            return this.populateCommands()
          }
        }
        return this.onHover(this.acRows[selectedIndex].selector)
      }
    }

    let selection = keys.slice(this.offset, this.offset + 10)
    this.removeAC()
    this.initAC()
    for (const command of selection) {
      if (command) this.attachCommandRow(command)
    }

    if (this.acRows[selectedIndex])
      this.onHover(this.acRows[selectedIndex].selector)
    else if (this.acRows.length > 0) this.onHover(this.acRows[0].selector)
  }
}
