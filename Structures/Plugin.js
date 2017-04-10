class Plugin {
    /**
     * Plugin constructor
     * @param {Object} info - The info object
     * @param {String} [info.name] - The name of the plugin, defaults to constructor name
     * @param {String} info.author - The author of the plugin
     * @param {String} info.version - The version of the plugin
     * @param {String} info.description - A description of the plugin
     * @param {String} [info.color] - An optional log colour
     */
    constructor(info) {
        if (this.constructor == Plugin) {
            throw new Error('Cannot instantiate an abstract class!');
        }
        if (!info.hasOwnProperty('author') || !info.hasOwnProperty('version') || !info.hasOwnProperty('description')) {
            throw new Error('A plugin must have an author, version, and description');
        }
        this.info = info;
    }

    /**
     * Functionality to call when the plugin is unloaded
     */
    unload() {

    }

    get name() {
        return this.info.name || this.constructor.name;
    }

    get author() {
        return this.info.author;
    }

    get version() {
        return this.info.version;
    }

    get description() {
        return this.info.description;
    }

    get color() {
        return this.info.color || 0x444444;
    }

    log(...args) {
        console.log(`%c[${this.name}]`, `color: #${this.color}; font-weight: bold;`, ...args);
    }
}

module.exports = Plugin;