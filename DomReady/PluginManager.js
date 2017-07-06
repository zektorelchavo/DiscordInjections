/**
 * A plugin manager, do not modify this.
 */

const reload = require('require-reload');
const PluginStruct = require('../Structures/Plugin');

class PluginManager {
    constructor() {
        this.classes = {};
        this.plugins = {};

        window._fs.readdir(this.constructPath(), (err, files) => {
            for (const file of files) {
                try {
                    if (window._fs.lstatSync(this.constructPath(file)).isDirectory()) {
                        this.load(file);
                    }
                } catch (err) {
                    console.error('Failed to load plugin', file, err);
                }
            }
        });
    }

    load(name) {
        try {
            let pack;
            try {
                pack = reload(this.constructPath(name, 'package'));
            } catch (err) { }
            if (!(pack instanceof Object)) {
                console.error(`Plugin '${name}' had an invalid package file, skipping`);
                return;
            }
            let entryPoint = pack.main || 'index';
            const Plugin = reload(this.constructPath(name, entryPoint));
            if (Plugin && Plugin.constructor && Plugin.prototype instanceof PluginStruct) {
                const plugin = new Plugin(this.constructPath(name));
                this.classes[name] = Plugin;
                this.plugins[name] = plugin;
                plugin.log('Loaded!');
            } else {
                console.error(`Plugin '${name}''s entry point was not an instance of the Plugin structure, skipping`);
            }
        } catch (err) {
            console.error('Failed to load plugin', name, err);
        }
    }

    unload(name) {
        this.plugins[name].unload();
        delete this.plugins[name];
        console.log(`Plugin ${name} has been unloaded.`);
    }

    reload(name) {
        try {
            const file = this.plugins[name].filePath;
            this.unload(name);
            this.load(name);
            console.log(`Plugin ${name} has been reloaded.`);
        } catch (err) {
            console.error('Failed to reload plugin', window._path.basename(name));
        }
    }

    constructPath(...args) {
        return this.path.join(__dirname, '..', 'Plugins', ...args);
    }

    get path() {
        return window._path;
    }
}

module.exports = PluginManager;
