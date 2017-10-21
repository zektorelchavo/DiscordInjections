const resolver = new (require('discord.js/src/client/ClientDataResolver'))(window.DI.client);

class Helpers {

    constructor() {
        this.localChannelId = window.location.pathname.split('/')[3];
        const that = this; // just incase.
        
        let a = new Date().getTime()
        webpackJsonp([],{[a]:(_, __, d) => {
            let i = 0
            const tick = () => {
                if (that._sendAsClydeRaw && that._fakeMessageRaw) return clearInterval(tick)
                let r;try{r=d(i)}catch(e){return};
                for (let key in r) {
                    if (key === "sendBotMessage" && typeof r[key] === "function") {
                        console.log("Found sendBotMessage")
                        that._sendAsClydeRaw = r[key].bind(r)
                    }
                    if (key === "receiveMessage" && typeof r[key] === "function") {
                        console.log("Found receiveMessage")
                        that._fakeMessageRaw = r[key].bind(r)
                    }
                }
                i++;
                if (i === 7000) clearInterval(tick)
            }
            setInterval(tick, 5)    
            
            }
        },[a])
        
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
        this._sendAsClydeRaw(window.DI.client.selectedChannel.id, message)
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
        this._fakeMessageRaw(window.DI.client.selectedChannel.id, this.constructMessage(base))
        const className="is-local-bot-message"
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
