/**
 * Bridge Discord's WebSocket to Discord.JS
 * Adapted from GusCaplan's Discord.JS bridge https://github.com/GusCaplan
 * https://github.com/GusCaplan/discord_preload/blob/master/src/DJSBridge.js
 */

const Discord = require('discord.js');

require('./DiscordMutator');

module.exports = Discord.Client;
