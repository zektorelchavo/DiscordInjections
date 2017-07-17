const moment = require('moment');

class Helpers {

    constructor() {
        this.fakeIds = [];
        this.localChannelId = window.location.pathname.split("/")[3];

        window.DI.StateWatcher.on('channelChanged', this.deleteLocalMessages.bind(this));
    }

    deleteLocalMessages() {
        for (const id of this.fakeIds) {
            let output = {
                data: {
                    d: {
                        id,
                        channel_id: this.localChannelId
                    },
                    t: 'MESSAGE_DELETE',
                    op: 0
                }
            };
            output.data = JSON.stringify(output.data);
            window.DI.ws.onmessage(output);
        }
        this.fakeIds = [];

        this.localChannelId = window.location.pathname.split("/")[3];
    }

    createElement(text) {
        let div = document.createElement('div');
        div.innerHTML = text;
        return div.childNodes[0];
    }

    sanitize(message) {
        return message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
    }

    generateSnowflake() {
        // Yeah I know, it's inaccurate, but it doesn't need to be accurate
        return ((Date.now() - 1420070400000) * 4194304).toString();
    }

    constructMessage(obj = {}) {
        obj.username = obj.username || 'Clyde';
        obj.attachments = obj.attachments || [];
        obj.embeds = obj.embeds || [];
        if (!obj.content && obj.attachments.length == 0 && obj.embeds.length == 0)
            throw new Error('No content, attachment, or embed');

        let id = this.generateSnowflake();
        this.fakeIds.push(id);
        let output = {
            data: {
                d: {
                    nonce: this.generateSnowflake(),
                    id,
                    attachments: obj.attachments,
                    tts: false,
                    embeds: obj.embeds,
                    timestamp: Date.now(),
                    mention_everyone: false,
                    pinned: false,
                    edited_timestamp: null,
                    author: {
                        username: obj.username,
                        discriminator: '0000',
                        id: obj.username,
                        bot: true
                    },
                    mention_roles: [],
                    content: obj.content,
                    channel_id: window.DI.client.selectedChannel.id,
                    mentions: [],
                    type: 0
                },
                t: 'MESSAGE_CREATE',
                op: 0
            }
        };

        output.data = JSON.stringify(output.data);
        return output;
    }

    sendClyde(message) {
        return this.sendLog('Clyde', message, undefined);
    }

    // Please refrain from using this, this should be reserved for base DiscordInjections notifications only
    sendDI(message) {
        return this.sendLog('DiscordInjections', message, 'https://discordinjections.xyz/img/logo.png');
    }

    sendLog(name, message, avatarURL = '/assets/f78426a064bc9dd24847519259bc42af.png') {
        if (!this.localChannelId)
            this.localChannelId = window.location.pathname.split("/")[3];
        let base = {
            username: name,
            content: message
        };
        if (typeof message == 'object') {
            base.content = undefined;
            for (let key in message) {
                base[key] = message[key];
            }
        }
        window.DI.ws.onmessage(this.constructMessage(base));

        let elem = document.querySelector('.messages .message-group:last-child');
        let className = 'di-clydelike-' + name.replace(/\s/g, '-').replace(/[^\w-]+/g, '');
        if (!elem.classList.contains(className)) {
            elem.classList.add(className);
            elem.classList.add('is-local-bot-message');
            document.querySelector(`.${className}:last-child .avatar-large`).setAttribute('style', `background-image: url('${avatarURL}');`);

            let delElem = this.createElement(`<div class="local-bot-message">Only you can see this —
             <a onclick="this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode)">
             delete this message</a>.</div>`);
            document.querySelector(`.${className}:last-child .comment`).appendChild(delElem);
        } else {
            document.querySelector(`.${className}:last-child .local-bot-message a`).innerHTML = 'delete these messages';
        }
        document.querySelector('.messages').scrollTop = elem.offsetTop;
    }
}

module.exports = Helpers;