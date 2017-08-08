/**
 * A plugin manager, do not modify this.
 */

const reload = require('require-reload');
const solve = require('toposort');
const PluginStruct = require('../Structures/Plugin');

class PluginManager {
    constructor() {
        this.classes = {};
        this.plugins = {};
        this.intialized = false

        const dependencies = [];

        window._fs.readdir(this.constructPath(), (err, files) => {
            for (const file of files) {
                try {
                    if (window._fs.statSync(this.constructPath(file)).isDirectory()) {
                        // preload, don't instantiate plugin
                        const pluginName = this.load(file, true);
                        const Plugin = this.classes[pluginName];

                        if (Plugin.before && Array.isArray(Plugin.before)) {
                            Plugin.before.forEach(dep => dependencies.push([ /* load */ pluginName, /* before */ dep ]));
                        }
                        if (Plugin.after && Array.isArray(Plugin.after)) {
                            Plugin.after.forEach(dep => dependencies.push([ /* load */ dep, /* before */ pluginName ]));
                        }
                    }
                } catch (err) {
                    console.error('Failed to parse plugin', file, err);
                }
            }

            const plugins = Object.keys(this.classes);
            const order = solve.array(plugins, dependencies);
            const skip = [];

            order.forEach(plugin => {
                if (!this.load(plugin)) {
                    skip.push(plugin);
                    console.error('Failed to load plugin, undefined behaviour possible!', plugin);
                    // TODO: handle before and after flags maybe?
                }
            })

            // emit plugins-loaded to all plugins with an array of all loaded plugins
            const loaded = plugins.filter(v => !skip.includes(v));
            this.pluginEmit('plugins-loaded', loaded);
            this.initialized = true
        })
    }

    pluginEmit(ev, ...args) {
        Object.keys(this.plugins).forEach(name => {
            this.plugins[name].emit(ev, ...args);
        });
    }

    load(name, preload = false) {
        if (Array.isArray(name)) {
            let loaded = [];
            for (const nam of name) if (this.load(nam)) loaded.push(nam);
            return loaded;
        }
        try {
            name = name.toLowerCase();
            let pack;
            let dirs = window._fs.readdirSync(this.constructPath()).filter(n => n.toLowerCase() === name);
            if (dirs.length === 0) throw new Error('No files found');
            try {
                pack = reload(this.constructPath(dirs[0], 'package'));
            } catch (err) { }
            if (!(pack instanceof Object)) {
                console.error(`Plugin '${name}' had an invalid package file, skipping`);
                return;
            }
            let entryPoint = pack.main || 'index';
            const Plugin = reload(this.constructPath(dirs[0], entryPoint));
            if (Plugin && Plugin.constructor && Plugin.prototype instanceof PluginStruct) {
                this.classes[name] = Plugin;

                if (!preload) {
                    const plugin = new Plugin(this.constructPath(dirs[0]), dirs[0]);
                    this.plugins[name] = plugin;
                    plugin.log('Loaded!');

                    if (this.initialized) {
                        plugin.emit('plugins-loaded', Object.keys(this.plugins).concat([name]));
                    }
                }
                return name;
            } else {
                console.error(`Plugin '${name}'s entry point was not an instance of the Plugin structure, skipping`);
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
            name = name.toLowerCase();
            this.plugins[name]._unload();
            delete this.plugins[name];
            delete this.classes[name];
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
            name = name.toLowerCase();
            this.unload(name);
            this.load(name);
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
