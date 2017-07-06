/**
 * Bridge Discord's WebSocket to Discord.JS
 * Adapted from GusCaplan's Discord.JS bridge https://github.com/GusCaplan
 * https://github.com/GusCaplan/discord_preload/blob/master/src/DJSBridge.js
 */

const Discord = require('discord.js');

(require('./DiscordMutator'))(Discord);

Discord.PacketManager = require('discord.js/src/client/websocket/packets/WebSocketPacketManager');
Discord.Websocket = require('discord.js/src/client/websocket/WebSocketConnection');
Discord.Constants = require('discord.js/src/util/Constants');

// just requiring erlpack using electron remote would result in a shitload of proxies which are VERY SLOW
const erlpack = require(require('electron').remote.require('erlpack').path);
class BridgedWS {
    constructor(client) {
        this.client = client;
        this.packetManager = new Discord.PacketManager(this);
        this.eventMessageBound = this.onMessage.bind(this);
        this.ws = null;
        this.disabledEvents = [];

        this.connection = {};
        this.sequence = -1;
    }

    set(ws) {
        if (this.ws) {
            this.ws.removeEventListener('message', this.eventMessageBound);
            delete this.ws;
        }
        this.ws = ws;
        ws.addEventListener('message', this.eventMessageBound);
        this.status = Discord.Constants.Status.READY;
    }

    onMessage(event) {
        let data = event.data;
        try {
            if (typeof data === 'string') data = JSON.parse(data);
            else data = erlpack.unpack(Buffer.from(data));
        } catch (err) {
            console.log(err);
            return;
        }
        this.client.emit('raw', data);
        this.packetManager.handle(data);
    }

    // dummy functions to fool discord.js
    connect() { } // eslint-disable-line no-empty-function
    destroy() { } // eslint-disable-line no-empty-function
    send() { } // eslint-disable-line no-empty-function
    heartbeat() { } // eslint-disable-line no-empty-function
    setSequence(s) {
        this.sequence = s > this.sequence ? s : this.sequence;
    }
    _emitReady() {
        this.connection.status = Discord.Constants.Status.READY;
        this.client.emit(Discord.Constants.Events.READY);
    }
    checkIfReady() {
        this._emitReady();
    }
}

class BridgedClient extends Discord.Client {
    constructor(options) {
        super(options);
        this.ws.connection = new BridgedWS(this);
        let lastpath = window.location.pathname;
        this.setInterval(()=>{
            if(lastpath === window.location.pathname) return;
            this.emit('selectedUpdate', {
                guild: this.guilds.get(lastpath.split("/")[2]),
                channel: lastpath.split("/")[3] ? this.channels.get(lastpath.split("/")[3]) : undefined
            }, {
                guild: this.guilds.get(window.location.pathname.split("/")[2]),
                channel: window.location.pathname.split("/")[3] ? this.channels.get(window.location.pathname.split("/")[3]) : undefined
            });
            lastpath = window.location.pathname;
        }, 100)
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
