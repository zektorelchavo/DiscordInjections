const crypto = require('crypto');
const Websocket = require('ws');

class SettingsSync {
    constructor() {
        // This is the main starting point of the SettingsSync functionality. There is a bot that you can either DM or give a command,
        // and it will generate a sync token for you. It DMs this token to you, and so that it syncs across
        // all clients, we set it to the bot's user note.
        window.DI.client.on('message', msg => {
            // Generate a key that doesn't get stored remotely, to encrypt/decrypt settings
            // #PRIVACY! owo
            this.generateKey().then(key => {
                let note = {
                    token: msg.content,
                    key
                };
                // This checks it's a DM, if the author is the bot, and if it's the token being provided
                // (confirmation message contains spaces)
                if (!msg.guild && msg.author.id === window.DI.Constants.DIBot && !msg.content.includes(' ')) {
                    window.DI.client.rest.makeRequest('put', `/users/@me/notes/${window.DI.Constants.DIBot}`,
                        true, { note: JSON.stringify(note) });
                }
            });
        });
        console.log('Settings syncer initialized.');

        if (window.DI.client.readyAt != null)
            this.initWS();
        else window.DI.client.on('ready', this.initWS.bind(this));
    }

    initWS() {
        if (this.ws) {
            this.ws.close(1000);
            this.ws.removeAllListeners();
        }
        try {
            let diSettings = JSON.parse(window.DI.localStorage.getItem('DI-DiscordInjections'));
            if (diSettings.sync.enabled) {
                this.ws = new Websocket(diSettings.sync.localWs ? 'ws://localhost:8099/ws' : 'wss://discordinjections.xyz/ws', undefined, {
                    headers: {
                        userid: window.DI.client.user.id,
                        auth: this.token
                    }
                });
                clearInterval(this.interval);
                this.ws.on('close', this.wsClose.bind(this));
                this.ws.on('message', this.wsMessage.bind(this));
                this.ws.on('open', () => {
                    console.log('SettingsSync WS opened');
                    this.sync();
                    this.interval = setInterval(this.sync.bind(this), diSettings.sync.interval);
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    destroy() {
        this.ws.close(1000);
        this.ws.removeAllListeners();
        delete this.ws;
        clearInterval(this.interval);
    }

    wsClose(code, reason) {
        let msg = 'Failed to connect to the SettingsSync WebSocket: ' + code;
        if (reason) msg += '\nReason: ' + reason;
        if (code == 4001) {
            msg += '\nPlease regenerate your DI token and restart your client.';
        } else if (code == 1000) {
            msg = 'SettingsSync WebSocket has been closed.';
        } else {
            msg += '\nReconnecting in 5 seconds...';
            setTimeout(this.initWS.bind(this), 5000);
        }
        console.log(msg);
    }

    wsMessage(msg) {
        msg = JSON.parse(msg);
        if (typeof msg === 'object' && msg.hasOwnProperty('code')) {
            switch (msg.code) {
                case 'ping': {
                    this.ws.send(JSON.stringify({ code: 'pong', time: msg.time }));
                    break;
                }
                case 'settings': {
                    for (const { key, data } of msg.data) {
                        let decrypted = this.decryptData(data);
                        if (key.startsWith('DI-')) {
                            let name = key.substring(3);
                            let plugin = Object.values(window.DI.PluginManager.plugins).filter(p => p.name === name)[0];
                            if (plugin) plugin.settings = JSON.parse(decrypted);
                        } else
                            window.DI.localStorage.setItem(key, decrypted);
                    }
                    console.log('Settings have been imported.');
                    break;
                }
            }
        }
    }

    get note() {
        try {
            return window.DI.client.user.notes.get('336957616527900672') || '{}';
        } catch (err) {
            return '{}';
        }
    }

    get key() {
        return JSON.parse(this.note).key;
    }

    get token() {
        return JSON.parse(this.note).token;
    }

    generateKey() {
        return new Promise((res, rej) => {
            crypto.randomBytes(32, (err, buf) => {
                if (err) rej(err);
                else res(buf.toString('base64'));
            });
        });
    }

    get isEnabled() {
        try {
            return JSON.parse(localStorage.getItem('DI-DiscordInjections')).sync.enabled;
        } catch (err) {
            return false;
        }
    }

    encryptData(data) {
        const cipher = crypto.createCipher('aes192', this.key);
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }

    decryptData(data) {
        const cipher = crypto.createDecipher('aes192', this.key);
        let decrypted = cipher.update(data, 'base64', 'utf8');
        decrypted += cipher.final('utf8');
        return decrypted;
    }

    getLastModified(key) {
        try {
            let lastModified = JSON.parse(window.DI.localStorage.getItem('DI-LastModified'));
            return lastModified[key];
        } catch (err) {
            return null;
        }
    }

    sync() {
        try {
            let data = {};
            let diSettings = JSON.parse(window.DI.localStorage.getItem('DI-DiscordInjections'));
            if (diSettings.sync.enabled) {
                console.log('Exporting settings...');

                if (diSettings.sync.keybinds) {
                    let comp = window.DI.localStorage.getItem('keybinds');
                    data['keybinds'] = {
                        encrypted: comp,
                        lastModified: this.getLastModified('keybinds')
                    };
                }

                if (diSettings.sync.emoteUsage) {
                    let comp = window.DI.localStorage.getItem('EmojiUsageHistory');
                    data['EmojiUsageHistory'] = {
                        encrypted: comp,
                        lastModified: this.getLastModified('EmojiUsageHistory')
                    };
                }

                if (diSettings.sync.inProgress) {
                    let comp = window.DI.localStorage.getItem('InProgressText');
                    data['InProgressText'] = {
                        encrypted: comp,
                        lastModified: this.getLastModified('InProgressText')
                    };
                }

                if (diSettings.sync.plugins) {
                    for (const [key, value] of Object.entries(diSettings.sync.plugin)) {
                        if (value === true) {
                            let plugin = window.DI.PluginManager.plugins[key];
                            if (plugin && plugin.hasSettings)
                                data['DI-' + key] = {
                                    encrypted: JSON.stringify(plugin.settings),
                                    lastModified: this.getLastModified('DI-' + key)
                                };
                        }
                    }
                }

                let encryptedData = {};
                for (const key in data) {
                    data[key].encrypted = this.encryptData(data[key].encrypted);
                    encryptedData[this.encryptData(key)] = data[key];
                }

                this.ws.send(JSON.stringify({
                    code: 'setsettings',
                    data: encryptedData
                }), err => {
                    if (err) console.error(err);
                });
            }
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = SettingsSync;