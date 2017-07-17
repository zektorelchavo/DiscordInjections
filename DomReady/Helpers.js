const moment = require('moment');

class Helpers {

    static createElement(text) {
        let div = document.createElement('div');
        div.innerHTML = text;
        return div.childNodes[0];
    }

    static sanitize(message) {
        return message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
    }

    static generateSnowflake() {
        // Yeah I know, it's inaccurate, but it doesn't need to be accurate
        return ((Date.now() - 1420070400000) * 4194304).toString();
    }

    static constructMessage(obj = {}) {
        obj.username = obj.username || 'Clyde';
        obj.attachments = obj.attachments || [];
        obj.embeds = obj.embeds || [];
        if (!obj.content && obj.attachments.length == 0 && obj.embeds.length == 0)
            throw new Error('No content, attachment, or embed');
        let output = {
            data: {
                d: {
                    nonce: Helpers.generateSnowflake(),
                    id: Helpers.generateSnowflake(),
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

    static sendClyde(message) {
        return Helpers.sendLog('Clyde', message, undefined);
    }

    // Please refrain from using this, this should be reserved for base DiscordInjections notifications only
    static sendDI(message) {
        return Helpers.sendLog('DiscordInjections', message, 'https://discordinjections.xyz/img/logo.png');
    }

    static sendLog(name, message, avatarURL = '/assets/f78426a064bc9dd24847519259bc42af.png') {
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
        window.DI.ws.onmessage(Helpers.constructMessage(base));

        let elem = document.querySelector('.messages .message-group:last-child');
        let className = 'di-clydelike-' + name.replace(/\s/g, '-').replace(/[^\w-]+/g, '');
        if (!elem.classList.contains(className)) {
            elem.classList.add(className);
            elem.classList.add('is-local-bot-message');
            document.querySelector(`.${className}:last-child .avatar-large`).setAttribute('style', `background-image: url('${avatarURL}');`);

            let delElem = Helpers.createElement(`<div class="local-bot-message">Only you can see this —
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