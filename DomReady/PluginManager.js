/**
 * A plugin manager, do not modify this.
 */

const reload = require('require-reload');
const PluginStruct = require('../Structures/Plugin');

class PluginManager {
    constructor() {
        this.classes = {};
        this.plugins = {};

        window._fs.readdir(window._path.join(__dirname, '..', 'Plugins'), (err, files) => {
            for (const file of files) {
                if (file.endsWith('.js'))
                    this.load(file);
            }
        });
    }

    load(file) {
        const Plugin = require('../Plugins/' + file);
        if (Plugin.prototype instanceof PluginStruct) {
            const plugin = new Plugin();
            const name = plugin.name;
            this.classes[name] = Plugin;
            this.plugins[name] = plugin;
        }
    }

    unload(name) {
        this.plugins[name].unload();
        delete this.plugins[name];
    }

    reload(name) {
        const file = this.plugins[name].constructor.name;
        this.plugins[name].unload();
        delete this.plugins[name];
        this.classes[name] = reload('../Plugins/' + file);
        if (this.classes[name].prototype instanceof PluginStruct)
            this.plugins[name] = new this.classes[name]();
    }
}

module.exports = PluginManager;