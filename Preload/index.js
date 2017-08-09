/**
 * Script to inject into the PRELOADER. Modify as you see fit.
 */
let DIPluginInitialized = false;
const DI = window.DI = {
    ws: null,
    client: null,
    localStorage: null,
    PluginManager: null,
    CssInjector: null,
    StateWatcher: null,
    get DIPluginInitialized() { return DIPluginInitialized; },
    set DIPluginInitialized(val) { DIPluginInitialized = true; },
    // Bridges the websocket to Discord.JS (courtesy of GusCaplan)    
    onWebsocketReload(ws) {
        DI.client.ws.connection.set(ws);
    },

    getReactInstance(node) {
        return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
    }
};

// Intercepts the websocket before it is deleted.
require('./WebSocketInterceptor');

// Intercepts the localstorage before it is deleted.
require('./LocalStorageInterceptor');

// Initiate the Discord.JS websocket bridge client
const Client = require('./DiscordJSBridge');
// Keep window.client for legacy support
DI.client = new Client();