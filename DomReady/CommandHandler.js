/**
 * Custom Command Handler
 *  - Adapted from SlugMod by Snazzah#0371
 */

const CommandStruct = require('../Structures/Command');
const css = `

.di-autocomplete {
    display: block !important;
}

.di-autocomplete-commandinfo {
    text-align: right !important;
}

.command-usage {
    text-align: left !important;
    margin-left: 10px;
}

.command-plugin-tag {
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    border: #fff solid 1px;
    padding: 3px;
}

.command-plugin-tag.dark {
    background-color: rgba(0, 0, 0, 0.3);
}

.di-autocomplete-header-label {
    display: inline-block !important;
}
`;

class CommandHandler {
    constructor() {
        if (!window.DI.localStorage.getItem('customPrefix')) {
            window.DI.localStorage.setItem('customPrefix', '//');
        }

        this.commands = {};
        this.commandElements = {};

        this.hookCommand(new CommandStruct(null, { name: 'load', info: 'Loads a plugin.', usage: '<name>...', func: this.loadPlugin }));
        this.hookCommand(new CommandStruct(null, { name: 'unload', info: 'Unloads a plugin.', usage: '<name>...', func: this.unloadPlugin }));
        this.hookCommand(new CommandStruct(null, { name: 'reload', info: 'Reloads a plugin.', usage: '<name>...', func: this.reloadPlugin }));
        this.hookCommand(new CommandStruct(null, { name: 'setprefix', info: 'Sets the custom command prefix.', usage: '<prefix>', func: this.commandSetPrefix.bind(this) }));
        this.hookCommand(new CommandStruct(null, { name: 'setcss', info: 'Sets the custom css path.', usage: '<path>', func: this.setCssPath.bind(this) }));
        this.hookCommand(new CommandStruct(null, { name: 'echo', info: 'Is there an echo in here?', usage: '<text>', func: this.commandEcho }));

        document.addEventListener('input', this.onInput.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));

        this._styleTag = document.createElement('style');
        this._styleTag.id = 'di-command-style';
        this._styleTag.innerHTML = css;
        document.head.appendChild(this._styleTag);

        this.acRows = [];
        this.currentSet = [];
        this.offset = 0;
    }

    loadPlugin(args) {
        let plugins = window.DI.PluginManager.load(args);
        if (plugins.length === 0)
            window.DI.Helpers.sendDI('Failed to load any plugins! Please check console for errors.');
        else
            window.DI.Helpers.sendDI(`Loaded the plugin${plugins.length > 1 ? 's' : ''} ${plugins.join(', ')}.`);
    }
    unloadPlugin(args) {
        let plugins = window.DI.PluginManager.unload(args);
        if (plugins.length === 0)
            window.DI.Helpers.sendDI('Failed to unload any plugins! Please check console for errors.');
        else
            window.DI.Helpers.sendDI(`Unloaded the plugin${plugins.length > 1 ? 's' : ''} ${plugins.join(', ')}.`);
    }
    reloadPlugin(args) {
        let plugins = window.DI.PluginManager.reload(args);
        if (plugins.length === 0)
            window.DI.Helpers.sendDI('Failed to reload any plugins! Please check console for errors.');
        else
            window.DI.Helpers.sendDI(`Reloaded the plugin${plugins.length > 1 ? 's' : ''} ${plugins.join(', ')}.`);
    }
    setCssPath(args) {
        try {
            window.DI.CssInjector.set(args.join(' '));
            window.DI.Helpers.sendDI(`Changed the CSS path!`);
        } catch (err) {
            window.DI.Helpers.sendDI(`Error: ${err.message}`);
        }
    }
    commandEcho(args) {
        window.DI.Helpers.sendLog(window.DI.client.user.username, args.join(' '), window.DI.client.user.avatarURL);
    }
    commandSetPrefix(args) {
        let slashWarning = false;
        let prefix = '//';
        if (args.length > 0) {
            prefix = args.join(' ');
            if (prefix === '/') slashWarning = true;
            this.setPrefix(prefix);
        } else {
            this.setPrefix(prefix);
        }
        window.DI.Helpers.sendDI(`Set the custom prefix to \`${prefix}\`.\n${slashWarning ? `Warning: Setting the prefix to \`/\` may have undesired consequences due to conflict with the actual client. If you run into issues, you may reset your prefix by opening the console (ctrl+shift+i) and typing:\n\`\`\`\nDI.CommandHelper.setPrefix('//')\n\`\`\`` : ''}`);
    }
    setPrefix(prefix) {
        window.DI.localStorage.setItem('customPrefix', prefix);
        console.log('The prefix has been changed to', prefix);
    }

    get prefix() {
        return window.DI.localStorage.getItem('customPrefix').toLowerCase();
    }

    hookCommand(command) {
        if (command instanceof CommandStruct) {
            if (this.commands[command.name]) throw new Error(`A command with the name ${command.name} already exists!`);
            this.commands[command.name] = command;
            this.commandElements[command.name] = this.makeACRow(command);
            console.log(`Loaded command '${command.name}' ${command.plugin ? 'from plugin ' + command.plugin.name : ''}.`);
        } else throw new Error('Tried to load a non-command', command);
    }

    unhookCommand(name) {
        if (this.commands[name]) {
            let command = this.commands[name];
            delete this.commands[name];
            delete this.commandElements[name];
            console.log(`Unloaded command '${command.name}' ${command.plugin ? 'from plugin ' + command.plugin.name : ''}.`);
        }
    }

    get textarea() {
        return document.querySelector('.chat .content textarea');
    }

    get autoComplete() {
        return document.querySelector('.di-autocomplete');
    }

    get selectedIndex() {
        if (this.lastHovered == undefined || this.acRows.length === 0) return null;
        let index = 0;
        for (const { selector } of this.acRows) {
            if (this.lastHovered === selector) return index;
            index++;
        }
    }

    onInput() {
        let textarea = this.textarea;
        if (!textarea || textarea !== document.activeElement || !textarea.value.startsWith(this.prefix)) {
            if (this.autoComplete) this.removeAC();
            return;
        };
        let ac = this.autoComplete;
        let content = textarea.value.toLowerCase();
        if (!ac) { this.initAC(); ac = this.autoComplete; }
        if (content.trim() === this.prefix) {
            this.offset = 0;
            this.currentSet = Object.keys(this.commands);
            this.populateCommands();
        } else {
            content = content.substring(this.prefix.length).trim();
            let [command, ...others] = content.split(' ');
            this.currentSet = Object.keys(this.commands).filter(k => k.includes(command));
            if (this.currentSet.length === 0) {
                this.removeAC();
                return;
            }
            let exact = this.currentSet.find(k => k === command);
            if (exact && others.length > 0) {
                this.currentSet = [exact];
            } else {
                this.currentSet.sort((a, b) => {
                    let score = 0;
                    if (command === a) score += 100;
                    if (command === b) score -= 100;
                    if (a.startsWith(command)) score += 10;
                    if (b.startsWith(command)) score -= 10;
                    score += a < b ? 1 : -1;
                    return -score;
                });
            }
            this.offset = 0;
            this.populateCommands();
        }
    }

    populateCommands(move = false, up = true) {
        let keys = this.currentSet;


        if (this.acRows.length === 0) {
            let selection = keys.slice(0, 10);
            this.clearAC();
            let first = true;
            for (const command of selection) {
                this.attachACRow(command);
            }
            if (this.acRows.length > 0)
                this.onHover(this.acRows[0].selector);
            return;
        }
        let selectedIndex = this.selectedIndex;

        let offset = this.offset;
        if (this.currentSet.length >= 10) {
            if (offset < 0) {
                offset = this.currentSet.length - 10;
                selectedIndex = 9;
            }
            if (offset >= this.currentSet.length - 9) {
                offset = 0;
                selectedIndex = 0;
            }
        } else offset = 0;
        this.offset = offset;

        if (move) {
            if (up) {
                selectedIndex--;
                if (selectedIndex < 0) {
                    if (this.currentSet.length < 10) {
                        selectedIndex = this.currentSet.length - 1;
                    } else {
                        this.offset--;
                        return this.populateCommands();
                    }
                }
                return this.onHover(this.acRows[selectedIndex].selector);
            } else {
                selectedIndex++;
                if (selectedIndex >= Math.min(10, this.currentSet.length)) {
                    if (this.currentSet.length < 10) {
                        selectedIndex = 0;
                    } else {
                        this.offset++;
                        return this.populateCommands();
                    }
                }
                return this.onHover(this.acRows[selectedIndex].selector);
            }
        }

        let selection = keys.slice(this.offset, this.offset + 10);
        this.clearAC();
        for (const command of selection) {
            if (command)
                this.attachACRow(command);
        }

        if (this.acRows[selectedIndex])
            this.onHover(this.acRows[selectedIndex].selector);
        else if (this.acRows.length > 0) this.onHover(this.acRows[0].selector);
    }

    onKeyDown(event) {
        let ac;
        if (!this.textarea || (event.target === this.textarea && event.key === 'Enter' && this.textarea.value === '')) {
            return;
        };
        if (this.textarea.value.toLowerCase().startsWith(this.prefix))
            switch (event.key) {
                case 'ArrowUp':
                    if (this.acRows.length > 0) {
                        this.populateCommands(true, true);
                        event.preventDefault();
                    }
                    break;
                case 'ArrowDown':
                    if (this.acRows.length > 0) {
                        this.populateCommands(true, false);
                        event.preventDefault();
                    }
                    break;
                case 'Tab':
                    if (this.lastHovered) {
                        this.lastHovered.click();
                        event.preventDefault();
                    }
                    break;
                case 'Enter':
                    if (event.shiftKey) return;
                    let command = this.textarea.value;
                    command = command.substring(this.prefix.length).trim();
                    let [name, ...args] = command.split(' ');
                    name = name.toLowerCase();
                    args = window.DI.Helpers.filterMessage(args.join(' ')).split(' ');
                    if (this.commands[name]) {
                        this.textarea.textContent = this.textarea.value = '';

                        try {
                            let inProgress = JSON.parse(window.DI.localStorage.getItem('InProgressText'));
                            inProgress[window.DI.client.selectedChannel.id] = undefined;
                            window.DI.localStorage.setItem('InProgressText', JSON.stringify(inProgress));
                        } catch (err) {
                            console.error(err);
                        }

                        this.onInput();
                        event.preventDefault();
                        let output = this.commands[name]._execute(args);
                        if (output) {
                            if (output instanceof Promise)
                                output.then(out => window.DI.client.selectedChannel.send(out));
                            else
                                window.DI.client.selectedChannel.send(output);
                        }
                        break;
                    }
            }
    }

    get selectedClass() {
        return 'selectorSelected-2M0IGv';
    }

    onHover(element) {
        for (const elem of this.acRows) {
            elem.selector.classList.remove(this.selectedClass);
        }
        element.classList.add(this.selectedClass);
        this.lastHovered = element;
    }

    createElement(text) {
        let div = document.createElement('div');
        div.innerHTML = text;
        return div.childNodes[0];
    }

    makeSelection(text) {
        let ta = this.textarea;
        if (ta) {
            let components = ta.value.split(' ');
            if (components.length > 1) {
                components[0] = this.prefix + text;
                ta.value = components.join(' ');
            } else
                ta.value = this.prefix + text + ' ';
            this.onInput();
        }
    }

    makeACRow(command) {
        const h2rgb = hex => {
            var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)
            ] : null;
        };
        const isDark = c => (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) > 150 ? false : true;
        let element = this.createElement(`<div class="autocompleteRowVertical-3_UxVA autocompleteRow-31UJBI command">
            <div class="selector-nbyEfM selectable-3iSmAf" onclick="DI.CommandHandler.makeSelection('${command.name}');"
            onmouseover="DI.CommandHandler.onHover(this);">
<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO content-249Pr9"
style="flex: 1 1 auto;">
<img class="icon-3XfMwL" src="https://discordinjections.xyz/img/logo-alt-nobg.svg">
<div class="marginLeft4-3RAvyQ">${command.name}</div>
<div class="marginLeft4-3RAvyQ primary400-1OkqpL">${command.usage}</div>

<div class="ellipsis-1MzbWB primary400-1OkqpL di-autocomplete-commandinfo" style="flex: 1 1 auto";>${command.plugin ?
                `<span class='command-plugin-tag${isDark(h2rgb(command.plugin.color)) ? " dark" : ""}' style="color: #${command.plugin.color};border-color: #${command.plugin.color};">
                ${command.plugin.name}</span> - `
                : ''
            }${command.info}</div>
</div></div></div>`);

        return element;
    }

    attachACRow(name) {
        if (!this.autoComplete) this.initAC();
        this.acRows.push({
            name,
            info: this.commands[name].info,
            usage: this.commands[name].usage,
            selector: this.commandElements[name].childNodes[1],
            element: this.commandElements[name]
        });

        this.autoComplete.appendChild(this.commandElements[name]);
    }

    initAC() {
        let elem = document.querySelector('form textarea');
        if (elem) {
            let element = this.createElement(`<div class="autocomplete-1TnWNR autocomplete-1LLKUa di-autocomplete">
            <div class="autocompleteRowVertical-3_UxVA autocompleteRow-31UJBI header">
            <div class="selector-nbyEfM" style="display: flex;"><div class="di-autocomplete-header-label contentTitle-sL6DrN primary400-1OkqpL weightBold-2qbcng">
            DiscordInjections Commands</div><div style="flex: 1 1;" class="di-autocomplete-header-label contentTitle-sL6DrN di-autocomplete-commandinfo primary400-1OkqpL weightBold-2qbcng">
            PREFIX: ${this.prefix}</div></div></div></div>`);
            elem.parentElement.insertBefore(element, elem.nextSibling);
        }
    }

    clearAC() {
        this.removeAC();
        this.initAC();
    }

    removeAC() {
        let ac = this.autoComplete;
        if (ac) {
            ac.remove();
            this.acRows = [];
            this.lastHovered = null;
        }
    }
}

module.exports = CommandHandler;
