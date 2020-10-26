# VERY MUCH IMPORTANT ANNOUNCEMENT!!!

**AS YOU CAN SEE IN THE YELLOW BAR ON TOP, THIS PROJECT HAS BEEN ARCHIVED AND THUS IS DEAD.**

**IF YOU WANT TO REVIVE IT, PLEASE CONTAT KURA ON THE DTINKER DISCORD. BUT BE PREPARED TO EITHER SPEND MANPOWER OR MONEY.**

# DiscordInjections

[![latest release](https://img.shields.io/github/release/DiscordInjections/DiscordInjections.svg)](https://github.com/DiscordInjections/DiscordInjections/releases)
[![license](https://img.shields.io/github/license/DiscordInjections/DiscordInjections.svg)](https://github.com/DiscordInjections/DiscordInjections/blob/master/LICENSE.md)
[![discord](https://img.shields.io/discord/257299803397029899.svg)](https://discord.gg/EDwd5wr)
[![issues](https://img.shields.io/github/issues/DiscordInjections/DiscordInjections.svg)](https://github.com/DiscordInjections/DiscordInjections/issues)
[![prs](https://img.shields.io/github/issues-pr/DiscordInjections/DiscordInjections.svg)](https://github.com/DiscordInjections/DiscordInjections/pulls)

This script aims to pick up where [BeautifulDiscord](https://github.com/leovoel/BeautifulDiscord) ends. Not only does it support custom CSS injections, but it also gives you the ability for custom JavaScript.

## Important notice

This is version 4 of Discord Injections.

Please report any problems, bugs, suspicious behavior, etc to Github. Thank you very much!

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
6. Transparency and frame settings
7. Custom splash screen CSS

## Requirements

This module requires you to have [node.js](https://nodejs.org/en/download/) installed with ES6 support.

This module optionally requires [git](https://git-scm.com/downloads) for easier version updating.

## Installation

1. Go to the directory you would like to install this module in

2. Download the files

     #### With releases (currently no v4 versions have been released!)
    1. Download the [latest release](https://github.com/DiscordInjections/DiscordInjections/releases)
    2. Extract to the desired location

     #### With git
    1. Type `git clone https://github.com/DiscordInjections/DiscordInjections folderName`
    2. Type `git checkout tags/<VERSION>` to go to a specific version. This is recommended
    
    **NOTE**: No support is giving for `HEAD` - it is in a constant changing and breaking state.

3. Type `cd folderName`
4. Run `npm install`
5. Run `npm run inject`
6. Edit the config.json file as desired
7. Install any desired plugins, and then run `npm run install-plugins`

To uninstall, run `npm run uninject`

To reinstall, run `npm run reinject`

## Updating

**WARNING**: If you currently have any version below 4.X.X installed, you *must* run `npm run uninject` before doing this step, and then `npm run inject` afterwards!

### With releases
1. Download the [latest release](https://github.com/DiscordInjections/DiscordInjections/releases)
2. Extract to the desired location

### With git
1. Run `git fetch --tags`
2. Run `git checkout tags/<VERSION>`

or

1. Run `git pull` if you are using master

### Next Steps
1. Make sure all dependencies are installed (run `npm install` - new dependencies might have been added)

## Usage

All usage takes place in the folder you installed DiscordInjections into.

### Config

DiscordInjections has some configuration options. A default config.json file is provided as config.json.template. Feel free to copy over and customize it to your liking.

Every option that accepts paths can start with a placeholder:
<dl>
  <dt>`.`</dt>
  <dd>The working directory of DI</dd>

  <dt>`~`</dt>
  <dd>The users home path</dd>

  <dt>`%%`</dt>
  <dd>The config folder `discordinjections`. On Windows, it is located in `%APPDATA%`, on Linux, you can find it usually under `~/.config`</dd>

  <dt>`%`</dt>
  <dd>The config folder for your discord distribution (`discord`, `discordptb`, `discordcanary`, `discorddevelopment`). On Windows, it is located in `%APPDATA%`, on Linux, you can find it usually under `~/.config`</dd>

  <dt>`&`</dt>
  <dd>The runtime folder for your discord distribution (`discord`, `discordptb`, `discordcanary`, `discorddevelopment`). On Windows, it is located in `%LOCALAPPDATA%`, on Linux, you can find it usually under `~/.share`</dd>
</dl>

### CSS

The CSS tree can be changed in the settings of Discord.

To adjust the CSS for the splash screen, adjust the `splash` key of the config.json file. To see the HTML of the splash screen, extract the app.asar file in the Discord resources folder. Then load the app_bootstrap/spash/index.html in Vanilla [Electron](https://github.com/electron/electron/releases/latest).

### JavaScript

For extensibility, DiscordInjections uses a simple plugin system. Plugins are placed in the `Plugins/` directory.

To create a plugin, you must extend the `Structures/Plugin` class. See the `Plugins/SamplePlugin.js.EXAMPLE` file for an example.

For a list of plugins, visit [Plugins](https://github.com/DiscordInjections/Plugins)

##### WARNING

Plugins can be dangerous. Please read the disclaimer.

## Disclaimer

DiscordInjections is not responsible for any plugins created by a third party. Needless to say, running plugins can be ***extremely dangerous*** as it exposes your entire discord client, as well as localStorage.

Before adding a plugin, be sure to thoroughly check its code to see what it does.

Stay safe.
