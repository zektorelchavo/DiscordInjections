/**
 * Bridge Discord's WebSocket to Discord.JS
 * Adapted from GusCaplan's Discord.JS bridge https://github.com/GusCaplan
 * https://github.com/GusCaplan/discord_preload/blob/master/src/DJSBridge.js
 */

const Discord = require('discord.js');

Object.defineProperty(Discord.Guild.prototype, 'element', {
    get: function () {
        return document.getElementsByClassName("scroller guilds")[0].childNodes[this.position + 4];
    }
});

Discord.PacketManager = require('discord.js/src/client/websocket/packets/WebSocketPacketManager');

// just requiring erlpack using electron remote would result in a shitload of proxies which are VERY SLOW
const erlpack = require(require('electron').remote.require('erlpack').path);

class BridgedWS {
    constructor(client) {
        this.client = client;
        this.packetManager = new Discord.PacketManager(this);
        this.eventMessageBound = this.eventMessage.bind(this);
        this.ws = null;
        this.disabledEvents = [];
    }

    set(ws) {
        if (this.ws) {
            this.ws.removeEventListener('message', this.eventMessageBound);
            delete this.ws;
        }
        this.ws = ws;
        ws.addEventListener('message', this.eventMessageBound);
    }

    eventMessage(event) {
        let data = event.data;
        try {
            if (typeof data === 'string') data = JSON.parse(data);
            else data = erlpack.unpack(Buffer.from(data));
        } catch (err) {
            return;
        }

        this.packetManager.handle(data);
    }

    // dummy functions to fool discord.js
    connect() { } // eslint-disable-line no-empty-function
    destroy() { } // eslint-disable-line no-empty-function
    send() { } // eslint-disable-line no-empty-function
    heartbeat() { } // eslint-disable-line no-empty-function
    _emitReady() {
        this.status = Discord.Constants.Status.READY;
        this.client.emit(Discord.Constants.Events.READY);
    }
    checkIfReady() {
        this._emitReady();
    }
}

class BridgedClient extends Discord.Client {
    constructor(options) {
        super(options);
        this.ws = new BridgedWS(this);
    }

    get token() {
        try {
            return window.$localStorage.getItem('token').replace(/"/g, '');
        } catch (err) {
            return null;
        }
    }

    set token(x) { } // eslint-disable-line no-empty-function
}

module.exports = BridgedClient;