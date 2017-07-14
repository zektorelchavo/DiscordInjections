const Command = require('./Command');

class Plugin {
    /**
     * Plugin constructor
     * @param {Object} pack - The package.json object
     * @param {Object} config - The config object
     * @param {String} [config.color] - An optional log colour
     * @param {Any} [...] - Any other config fields
     */
    constructor(path, name) {
        if (this.constructor == Plugin) {
            throw new Error('Cannot instantiate an abstract class!');
        }
        this._name = name;
        this._commands = [];
        this._load(path);
    }

    get configTemplate() {
        return {
            color: 0x444444,
            iconURL: this.defaultIconURL
        };
    }

    get defaultIconURL() {
        if (!this.hash) this.hash = this.name.split('').reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0) % 4;
        switch (this.hash) {
            case 0: return `https://discordinjections.xyz/img/logo-alt-green.svg`;
            case 1: return `https://discordinjections.xyz/img/logo-alt-grey.svg`;
            case 2: return `https://discordinjections.xyz/img/logo-alt-red.svg`;
            case 3: return `https://discordinjections.xyz/img/logo-alt-yellow.svg`;
        }
    }

    get iconURL() {
        return this.config.iconURL || this.defaultIconURL;
    }

    _load(path) {
        this.path = path;
        this._loadPackage();
        this._loadConfig();
        this._loadCss();
    }

    _loadPackage(pack) {
        this.pack = require(window._path.join(this.path, 'package.json'));
        if (!this.pack.hasOwnProperty('author') || !this.pack.hasOwnProperty('version') || !this.pack.hasOwnProperty('description')) {
            throw new Error('A plugin must have an author, version, and description');
        }
    }

    _loadConfig() {
        try {
            this.config = require(window._path.join(this.path, 'config'));
            let save = false;
            for (const key in this.configTemplate) {
                if (!this.config.hasOwnProperty(key)) {
                    this.config[key] = this.configTemplate[key];
                    save = true;
                }
            }
            if (save)
                window._fs.writeFile(window._path.join(this.path, 'config.json'), JSON.stringify(config, null, 2));
        } catch (err) {
            let config = this.configTemplate;
            window._fs.writeFile(window._path.join(this.path, 'config.json'), JSON.stringify(config, null, 2));
            this.config = config;
        }
    }

    _loadCss() {
        try {
            let cssElement = this._styleTag;
            if (!cssElement) {
                cssElement = document.getElementById(`CSS-${this.name}`) || document.createElement('style');
                cssElement.id = `CSS-${this.name}`;
                this._styleTag = cssElement;
                document.head.appendChild(this._styleTag);
            }
            let cssDir = window._path.join(this.path, 'css');
            if (window._fs.lstatSync(cssDir).isDirectory()) {
                let files = window._fs.readdirSync(cssDir);
                let css = '';
                for (const file of files) {
                    if (window._path.extname(file) !== '.css') continue;
                    css += `/* ${file} */\n\n`;
                    let content = window._fs.readFileSync(window._path.join(cssDir, file), { encoding: 'UTF8' });
                    css += content + '\n\n';
                }
                cssElement.innerHTML = css;
            }

            if (!this._cssWatcher) {
                this._cssWatcher = window._fs.watch(this.path, { encoding: 'utf-8' },
                    eventType => {
                        if (eventType == 'change') {
                            this._loadCss();
                        }
                    });
            }
        } catch (err) {
            this.log('Skipping CSS injection');
        }
    }

    _unload() {
        for (const command of this._commands) {
            window.DI.CommandHandler.unhookCommand(command.name);
        }
        if (this._cssWatcher) this._cssWatcher.close();
        let cssElement = document.getElementById(`CSS-${this.name}`);
        if (cssElement) cssElement.parentElement.removeChild(cssElement);

        this.unload();
    }

    /**
     * Functionality to call when the plugin is unloaded
     */
    unload() {

    }

    get name() {
        return this._name || this.pack ? this.pack.name || this.constructor.name : this.constructor.name;
    }

    get author() {
        return this.pack.author;
    }

    get version() {
        return this.pack.version;
    }

    get description() {
        return this.pack.description;
    }

    get color() {
        return this.config ? this.config.color || 0x444444 : 0x444444;
    }

    log(...args) {
        console.log(`%c[${this.name}]`, `color: #${this.color}; font - weight: bold; `, ...args);
    }

    error(...args) {
        console.error(`%c[${this.name}]`, `color: #${this.color}; font - weight: bold; `, ...args);
    }

    registerCommand(options) {
        let command = new Command(this, options);
        window.DI.CommandHandler.hookCommand(command);
        this._commands.push(command);
    }

    sendLocalMessage(message, sanitize) {
        return window.DI.Helpers.sendLog(this.name, message, this.iconURL, sanitize);
    }
}

module.exports = Plugin;
