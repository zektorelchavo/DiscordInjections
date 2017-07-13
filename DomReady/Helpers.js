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

    static sendClyde(message, sanitize = true) {
        return Helpers.sendLog('Clyde', message, sanitize);
    }

    // Please refrain from using this, this should be reserved for base DiscordInjections notifications only
    static sendDI(message, sanitize = true) {
        return Helpers.sendLog('DiscordInjections', message, 'https://discordinjections.xyz/img/logo.png', sanitize);
    }

    static sendLog(name, message, avatarURL = '/assets/f78426a064bc9dd24847519259bc42af.png', sanitize = true) {
        if (sanitize) message = Helpers.sanitize(message);
        let className = 'di-clydelike-' + name.replace(/\s/g, '-').replace(/[^\w-]+/g, '');
        if (!document.querySelector('.messages .message-group:last-child').classList.contains(className)) {
            let elem = Helpers.createElement(`<div class="message-group hide-overflow is-local-bot-message ${className}">
            <div class="avatar-large stop-animation" style="background-image: url(&quot;${avatarURL}&quot;);">
            </div><div class="comment"><div class="message first"><div class="body"><h2><span class="username-wrapper">
            <strong class="user-name" renamer="">${name}</strong><span class="bot-tag">BOT</span>
            </span><span class="highlight-separator"> - </span><span class="timestamp">Today at ${moment().format('hh:mm A')}</span></h2>
            <div class="message-text"><div class="markup">${message}</div></div></div><div class="accessory"></div></div>
            <div class="local-bot-message">Only you can see this —
             <a onclick="this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode)">
             delete this message</a>.</div></div></div>`);
            let messages = document.querySelector(".messages");
            messages.appendChild(elem);
            messages.scrollTop = elem.offsetTop;
        } else {
            document.querySelector(`.${className}:last-child .local-bot-message a`).innerHTML = 'delete these messages';
            let elem = Helpers.createElement(`<div class="message"><div class="body"><div class="message-text">
            <div class="markup">${message}</div></div></div><div class="accessory"></div></div>`);
            let elem2 = document.querySelector(`.${className}:last-child .local-bot-message`);
            elem2.parentNode.insertBefore(elem, elem2);
            let messages = document.querySelector(".messages");
            messages.scrollTop = elem.offsetTop;
        }
    }
}

module.exports = Helpers;