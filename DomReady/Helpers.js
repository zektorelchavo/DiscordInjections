const resolver = new (require('discord.js/src/client/ClientDataResolver'))(window.DI.client);

class Helpers {

    constructor() {
        this.localChannelId = window.location.pathname.split('/')[3];
    }

    createElement(text) {
        let div = document.createElement('div');
        div.innerHTML = text;
        return div.childNodes[0];
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
                        id: "1", // we want a clyde effect
                        avatar: "clyde",
                        bot: true
                    },
                    mention_roles: [],
                    content: obj.content,
                    channel_id: window.DI.client.selectedChannel.id,
                    mentions: [],
                    type: 0
                }
        return output;
    }

    sendClyde(message) {
        let a = new Date().getTime()
        webpackJsonp([],{[a]:(a,b,d)=>{d(56).sendBotMessage(window.DI.client.selectedChannel.id, message)}},[a])
    }

    // Please refrain from using this, this should be reserved for base DiscordInjections notifications only
    sendDI(message) {
        return this.sendLog('DiscordInjections', message, 'https://discordinjections.xyz/img/logo.png');
    }

    sendLog(name, message, avatarURL = '/assets/f78426a064bc9dd24847519259bc42af.png') {
        let a = new Date().getTime()
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
        webpackJsonp([],{[a]:(a,b,d)=>{d(56).receiveMessage(window.DI.client.selectedChannel.id, this.constructMessage(base))}},[a])
        const className="is-local-bot-message"
        let elem = document.querySelector(`.${className}:last-child .avatar-large`);
        elem.setAttribute('style', `background-image: url('${avatarURL}');`);
        const destroyMessage = () => {
            try {
                document.querySelector(`.${className}:last-child .comment .local-bot-message a`).click()
                DI.StateWatcher.removeListener("channelChanged", destroyMessage) // fuck eventemitter3
            } catch(e) {
                if (e.message === "Cannot read property 'click' of null") return // js is cryïng
                throw e;
            }
        } 
        DI.StateWatcher.on("channelChanged", destroyMessage) // Destroy the message because I'm lazy to fix one bug
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
