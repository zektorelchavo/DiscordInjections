/**
 * Script to inject into the PRELOADER. Modify as you see fit.
 */
let DIPluginInitialized = false;
const pack = require('../package.json');
const DI = window.DI = {
    client: null,
    localStorage: null,
    PluginManager: null,
    CssInjector: null,
    StateWatcher: null,
    get DIPluginInitialized() { return DIPluginInitialized; },
    set DIPluginInitialized(val) { DIPluginInitialized = true; },

    getReactInstance(node) {
        return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
    },

    get version() { return pack.version; }
};

// Intercepts the localstorage before it is deleted.
require('./LocalStorageInterceptor');

// Initiate the Discord.JS websocket bridge client
const Client = require('./DiscordJSBridge');
DI.client = new Client();
DI.client.login(window.DI.localStorage.getItem('token').replace(/"/g, ''));