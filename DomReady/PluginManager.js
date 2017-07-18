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
        if (Array.isArray(name)) {
            let loaded = [];
            for (const nam of name) if (this.load(nam)) loaded.push(nam);
            return loaded;
        }
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
                const plugin = new Plugin(this.constructPath(name), name);
                this.classes[name.toLowerCase()] = Plugin;
                this.plugins[name.toLowerCase()] = plugin;
                plugin.log('Loaded!');
                return true;
            } else {
                console.error(`Plugin '${name}''s entry point was not an instance of the Plugin structure, skipping`);
            }
        } catch (err) {
            console.error('Failed to load plugin', name, err);
        }
    }

    unload(name) {
        if (Array.isArray(name)) {
            let loaded = [];
            for (const nam of name) if (this.unload(nam) === true) loaded.push(nam);
            return loaded;
        }
        try {
            this.plugins[name.toLowerCase()]._unload();
            delete this.plugins[name.toLowerCase()];
            delete this.classes[name.toLowerCase()];
            console.log(`Plugin ${name} has been unloaded.`);
            return true;
        } catch (err) {
            console.error('Failed to unload plugin', window._path.basename(name), err);
        }
    }

    reload(name) {
        if (Array.isArray(name)) {
            let loaded = [];
            for (const nam of name) if (this.reload(nam)) loaded.push(nam);
            return loaded;
        }
        try {
            this.unload(name.toLowerCase());
            this.load(name.toLowerCase());
            console.log(`Plugin ${name} has been reloaded.`);
            return true;
        } catch (err) {
            console.error('Failed to reload plugin', window._path.basename(name), err);
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
