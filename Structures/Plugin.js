class Plugin {
    /**
     * Plugin constructor
     * @param {Object} pack - The package.json object
     * @param {Object} config - The config object
     * @param {String} [config.color] - An optional log colour
     * @param {Any} [...] - Any other config fields
     */
    constructor(path) {
        if (this.constructor == Plugin) {
            throw new Error('Cannot instantiate an abstract class!');
        }
        this._load(path);
    }

    get configTemplate() {
        return {
            color: 0x444444
        };
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
            this.log('Skipping CSS injection')
        }
    }

    /**
     * Functionality to call when the plugin is unloaded
     */
    unload() {

    }

    get name() {
        return this.pack ? this.pack.name || this.constructor.name : this.constructor.name;
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
        console.log(`%c[${this.name}]`, `color: #${this.color}; font-weight: bold;`, ...args);
    }

    error(...args) {
        console.error(`%c[${this.name}]`, `color: #${this.color}; font-weight: bold;`, ...args);
    }
}

module.exports = Plugin;
