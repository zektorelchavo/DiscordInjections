/**
 * A plugin manager, do not modify this.
 */

const reload = require('require-reload');
const PluginStruct = require('../Structures/Plugin');

class PluginManager {
    constructor() {
        this.classes = {};
        this.plugins = {};

        this.walk(window._path.join(__dirname, '..', 'Plugins'));
    }

    walk(directory) {
        window._fs.readdir(directory, (err, files) => {
            for (const file of files) {
                switch (window._path.extname(file)) {
                    case '.js':
                        this.load(window._path.join(directory, file));
                        break;
                    case '':
                        this.walk(window._path.join(directory, file));
                        break;
                }
            }
        });
    }

    load(file) {
        const Plugin = require(file);
        if (Plugin && Plugin.constructor) {
            if (Plugin.prototype instanceof PluginStruct && Plugin.prototype.constructor.name === window._path.basename(file, '.js')) {
                const plugin = new Plugin();
                plugin.filePath = file;
                const name = plugin.name;
                this.classes[name] = Plugin;
                this.plugins[name] = plugin;
                plugin.log('Loaded!');
            }
        }
    }

    unload(name) {
        this.plugins[name].unload();
        delete this.plugins[name];
    }

    reload(name) {
        const file = this.plugins[name].filePath;
        console.log(file);
        this.plugins[name].unload();
        delete this.plugins[name];
        this.classes[name] = reload(file);
        if (this.classes[name].prototype instanceof PluginStruct) {
            this.plugins[name] = new this.classes[name]();
            this.plugins[name].filePath = file;
        }
    }
}

module.exports = PluginManager;
