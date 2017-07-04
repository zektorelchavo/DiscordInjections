module.exports = (Discord) => {
    Object.defineProperty(Discord.Client.prototype, 'selectedGuild', {
        get: function () {
            return this.guilds.get(window.location.pathname.split("/")[2]);
        }
    });

    Object.defineProperty(Discord.Client.prototype, 'selectedChannel', {
        get: function () {
            return window.location.pathname.split("/")[3] ? this.channels.get(window.location.pathname.split("/")[3]) : undefined;
        }
    });

    Object.defineProperty(Discord.Guild.prototype, 'element', {
        get: function () {
            return document.querySelector(`a[href*="${this.id}"]`).parentNode.parentNode.parentNode;
        }
    });

    Object.defineProperty(Discord.Guild.prototype, 'selected', {
        get: function () {
            return this.element.className.includes("selected");
        }
    });

    Object.defineProperty(Discord.DMChannel.prototype, 'element', {
        get: function () {
            return document.querySelector(`a[href="/channels/@me/${this.id}"]`) ? document.querySelector(`a[href="/channels/@me/${this.id}"]`).parentNode : null;
        }
    });

    Object.defineProperty(Discord.DMChannel.prototype, 'selected', {
        get: function () {
            return this.element.className.includes("selected");
        }
    });

    Object.defineProperty(Discord.GroupDMChannel.prototype, 'element', {
        get: function () {
            return document.querySelector(`a[href="/channels/@me/${this.id}"]`) ? document.querySelector(`a[href="/channels/@me/${this.id}"]`).parentNode : null;
        }
    });

    Object.defineProperty(Discord.GroupDMChannel.prototype, 'selected', {
        get: function () {
            return this.element.className.includes("selected");
        }
    });

    Object.defineProperty(Discord.TextChannel.prototype, 'visible', {
        get: function () {
            return this.permissionsFor(this.client.user).has("READ_MESSAGES");
        }
    });
};