const resolver = new (require('discord.js/src/client/ClientDataResolver'))(window.DI.client);

class Helpers {

    constructor() {
        this.localChannelId = window.location.pathname.split('/')[3];


    }

    get _sendAsClydeRaw() {
        return DI._sendAsClydeRaw;
    }
    get _fakeMessageRaw() {
        return DI._fakeMessageRaw;
    }


    createElement(text) {
        return document.createRange().createContextualFragment(text);
    }

    createModal(content) {
        const root = document.querySelector('#app-mount > div');

        if (this._modal) this.destroyModal();

        this._modal = this.createElement(`
            <div class="theme-dark DI-modal">
                <div class="callout-backdrop"></div>
                <div class="modal-2LIEKY" style="opacity: 1">
                    <div class="inner-1_1f7b DI-modal-inner expanded">
                        <div class="modal-3HOjGZ sizeMedium-1-2BNS">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>
        `);

        this._modal.querySelector('.DI-modal-inner').addEventListener('click', event => {
            event.stopPropagation();
        });
        let close = this._modal.querySelector('.DI-modal-close-button');
        if (close) close.addEventListener('click', this.destroyModal.bind(this));
        if (!this._hasSetKeyListener) {
            document.body.addEventListener('keyup', this._modalKeypress.bind(this));
            document.body.addEventListener('click', this.destroyModal.bind(this));
            this._hasSetKeyListener = true;
        }
        root.appendChild(this._modal);
        this._modal = root.querySelector('.DI-modal');
        let backdrop = this._modal.querySelector('.callout-backdrop');
        setTimeout(() => {
            backdrop.style.opacity = 0.60;
        }, 1);
    }

    _modalKeypress(e) {
        if (e.code === 'Escape') this.destroyModal();
    }

    destroyModal() {
        if (this._modal) {
            let backdrop = this._modal.querySelector('.callout-backdrop');
            let inner = this._modal.querySelector('.DI-modal-inner');
            let close = this._modal.querySelector('.DI-modal-close-button');
            backdrop.style.opacity = 0;
            inner.classList.remove('expanded');
            setTimeout(() => {
                if (close) close.addEventListener('click', this.destroyModal.bind(this));
                document.body.removeEventListener('keyup', this._modalKeypress.bind(this));
                document.body.removeEventListener('click', this.destroyModal.bind(this));
                this._modal.parentNode.removeChild(this._modal);
                this._modal = null;
            }, 200);

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
        let output = {
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
                id: '1', // we want a clyde effect
                avatar: 'clyde',
                bot: true
            },
            mention_roles: [],
            content: obj.content,
            channel_id: window.DI.client.selectedChannel.id,
            mentions: [],
            type: 0
        };
        return output;
    }

    sendClyde(message) {
        this._sendAsClydeRaw(window.DI.client.selectedChannel.id, message);
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
        this._fakeMessageRaw(window.DI.client.selectedChannel.id, this.constructMessage(base));
        const className = 'is-local-bot-message';
        let elem = document.querySelector(`.${className}:last-child .avatar-large`);
        elem.setAttribute('style', `background-image: url('${avatarURL}');`);
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
