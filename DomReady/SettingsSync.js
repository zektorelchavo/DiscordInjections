class SettingsSync {
    constructor() {
        // This is the main starting point of the SettingsSync functionality. There is a bot that you can either DM or give a command,
        // and it will generate a sync token for you. It DMs this token to you, and so that it syncs across
        // all clients, we set it to the bot's user note.
        window.DI.client.on('message', msg => {
            // This checks it's a DM, if the author is the bot, and if it's the token being provided (confirmation message contains spaces)
            if (!msg.guild && msg.author.id === '336957616527900672' && !msg.content.includes(' ')) {
                window.DI.client.rest.makeRequest('put', '/users/@me/notes/336957616527900672', true, { note: msg.content });
            }
        });

        console.log('Settings syncer initialized.');
    }
}

module.exports = SettingsSync;