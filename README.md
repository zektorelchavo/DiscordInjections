# DiscordInjections

This script aims to pick up where [BeautifulDiscord](https://github.com/leovoel/BeautifulDiscord) ends. Not only does it support custom CSS injections, but it also gives you the ability for custom JavaScript.

## DTinker

Need help installing? Want to give a suggestion? Want to just chat? I'm using DTinker as a hub for DiscordInjections! Click right on Lil' Bub's face to go there!

[![LIL BUB!!!](http://akns-images.eonline.com/eol_images/Entire_Site/201478/rs_500x270-140808102736-tumblr_my2hi3c3em1ruw1vso1_500.gif)](https://discord.gg/EDwd5wr)

[(Or click here if you're boring)](https://discord.gg/EDwd5wr)

## Features

1. Custom CSS
2. CSS hot-loading and watching
3. Custom JS in the form of Plugins
4. Custom commands
5. Custom settings
6. Exposes the native Discord WebSocket and localStorage

## Installation

1. Go to the directory you would like to install this module in.
2. Type `git clone https://github.com/DiscordInjections/DiscordInjections folderName`
3. Type `cd folderName`
4. Run `npm install`
5. Run `npm run inject`
6. Install any desired plugins, and then run `npm run install-plugins`

To uninstall, run `npm run uninject`

To reinstall, run `npm run reinject`

## Updating

**WARNING**: If you currently have version 1.X.X or 2.X.X installed, you *must* run `npm run uninject` before doing this step, and then `npm run inject` afterwards!

To update, run `git pull origin master`.

## Requirements

This module requires you to have [node.js](https://nodejs.org/en/download/) installed with ES6 support.

This module also requires [git](https://git-scm.com/downloads). 

## Usage

All usage takes place in the folder you installed DiscordInjections into.

### CSS

By default, DiscordInjections looks for a `style.css` file within the `CSS` folder. This file is not provided.

For a custom location, open the `General Settings` DiscordInjections settings tab in the user settings.

### JavaScript

There are two segments of JS that get injected.

#### Preload/index.js

This is content that gets injected before anything else in the discord client. It is what enables us to intercept the WS and localStorage objects. Put things that need to be loaded first here.

#### Plugins

For extensibility, DiscordInjections uses a simple plugin system. Plugins are placed in the `Plugins/` directory.

To create a plugin, you must extend the `Structures/Plugin` class. See the `Plugins/SamplePlugin.js.EXAMPLE` file for an example.

For a list of plugins, visit [Plugins](https://github.com/DiscordInjections/Plugins)

##### WARNING

Plugins can be dangerous. Please read the disclaimer.

#### Note

Do not touch the `DomReady` directory, as it is what handles the custom CSS injections and plugins.

### WebSockets and localStorage

Discord deletes its websocket and localStorage references to prevent tampering. In order to prevent deletion, these variables are stored to `DI.ws` and `DI.localStorage` respectively.

Additionally, Discord initiates a new websocket object every reconnect. To ensure that your implementation works properly, you should define a `window.onWebsocketReload` function, that takes a websocket as an input.

## Disclaimer

DiscordInjections is not responsible for any plugins created by a third party. Needless to say, running plugins can be ***extremely dangerous*** as it exposes your entire discord client, as well as localStorage.

Before adding a plugin, be sure to thoroughly check its code to see what it does.

Stay safe.