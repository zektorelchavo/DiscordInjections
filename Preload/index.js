/**
 * Script to inject into the PRELOADER. Modify as you see fit.
 */

// Intercepts the websocket before it is deleted.
require('./WebSocketInterceptor');

// Intercepts the localstorage before it is deleted.
require('./LocalStorageInterceptor');

// Initiate the Discord.JS websocket bridge client
const Client = require('./DiscordJSBridge');
window.client = new Client();

// Bridges the websocket to Discord.JS (courtesy of GusCaplan)
window.onWebsocketReload = function (newWs) {
    window.client.ws.set(newWs);
};