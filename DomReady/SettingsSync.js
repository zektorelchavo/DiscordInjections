const crypto = require('crypto');

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

    submit(key) {
        if (this.isEnabled) {
            let data = this.encryptData(window.DI.localStorage.getItem(key));
        }
    }
}

module.exports = SettingsSync;