const resolver = new (require('discord.js/src/client/ClientDataResolver'))(window.DI.client);

class Helpers {

    constructor() {
        this.fakeIds = [];
        this.localChannelId = window.location.pathname.split('/')[3];

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

        this.localChannelId = window.location.pathname.split('/')[3];
    }

    createElement(text) {
        return document.createRange().createContextualFragment(text);
    }

    createModal(content) {
        const root = document.querySelector('#app-mount > div');

        if (this._modal) this.destroyModal();

        this._modal = this.createElement(`
            <div class="theme-dark DI-modal">
                <div class="callout-backdrop" style="opacity: 0.85; background-color: black; transform: translateZ(0px);"></div>
                <div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);">
                    <div class="inner-1_1f7b">
                        <div class="modal-3HOjGZ sizeMedium-1-2BNS">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>
        `);

        this._modal.querySelector('.callout-backdrop').addEventListener('click', this.destroyModal.bind(this));
        if (!this._hasSetKeyListener) {
            document.body.addEventListener('keyup', this._modalKeypress.bind(this));
            this._hasSetKeyListener = true;
        }
        root.appendChild(this._modal);
        this._modal = root.lastElementChild;
    }

    _modalKeypress(e) {
        if (e.code === 'Escape') this.destroyModal();
    }

    destroyModal() {
        if (this._modal) {
            this._modal.querySelector('.callout-backdrop').removeEventListener('click');
            document.body.removeEventListener('keyup', this._modalKeypress.bind(this));
            this._modal.parentNode.removeChild(this._modal);
            this._modal = null;
        }
    }

    sanitize(message) {
        return message.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
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
            this.localChannelId = window.location.pathname.split('/')[3];
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
             <a onclick="DI.Helpers.deleteLocalMessages()">
             delete this message</a>.</div>`);
            document.querySelector(`.${className}:last-child .comment`).appendChild(delElem);
        } else {
            document.querySelector(`.${className}:last-child .local-bot-message a`).innerHTML = 'delete these messages';
        }
        document.querySelector('.messages').scrollTop = elem.offsetTop;
    }

    escape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    resolveUser(query) {
        return window.DI.client.users.find('tag', query.slice(1));
    }

    resolveMention(query) {
        let res = query.match(/<@!?[0-9]+>/g);
        if (!res) return null;
        return resolver.resolveUser(res[0].replace(/<|!|>|@/g, ''));
    }

    filterMessage(message) {
        window.DI.client.users.forEach(u => message = message.replace(new RegExp(this.escape(`@${u.tag}`), 'g'), u.toString()));
        if (window.DI.client.selectedGuild) {
            window.DI.client.selectedGuild.roles.forEach(r => {
                if (r.mentionable) {
                    message = message.replace(new RegExp(this.escape(`@${r.name}`), 'g'), r.toString());
                }
            });
            window.DI.client.selectedGuild.channels.forEach(c => message = message.replace(new RegExp(this.escape(`#${c.name}`), 'g'), c.toString()));
        }
        return message;
    }
}

module.exports = Helpers;
