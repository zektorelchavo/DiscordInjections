# DiscordInjections

This script aims to pick up where [BeautifulDiscord](https://github.com/leovoel/BeautifulDiscord) ends. Not only does it support custom CSS injections, but it also gives you the ability for custom JavaScript.

## Features

1. Custom CSS
2. CSS hot-loading and watching
3. Custom JS
4. Exposes the native Discord WebSocket and localStorage

## Installation

1. Go to the directory you would like to install this module in.
2. Type `git clone https://github.com/DiscordInjections/DiscordInjections folderName`
3. Type `cd folderName`
4. Run `npm install`
5. Install any desired plugins, and then run `npm run install-plugins`

To uninstall, run `npm run uninstall`

To reinstall, run `npm run reinstall`

## Updating

To update, run `git pull origin master`.

## Requirements

This module requires you to have [node.js](https://nodejs.org/en/download/) installed with ES6 support.

This module also requires [git](https://git-scm.com/downloads). 

## Usage

All usage takes place in the folder you installed DiscordInjections into.

### CSS

By default, DiscordInjections comes with a blank `style.css` file within the `CSS` folder. It is recommended to put in this folder, but in a different file (to prevent update conflicts).

For a custom location, open Content Inspector (`ctrl` + `shift` + `I`) and type
```
_cssInjector.set("path/to/css");
```

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

Discord deletes its websocket and localStorage references to prevent tampering. In order to prevent deletion, these variables are stored to `window.$ws` and `window.$localStorage` respectively.

Additionally, Discord initiates a new websocket object every reconnect. To ensure that your implementation works properly, you should define a `window.onWebsocketReload` function, that takes a websocket as an input.

## License

DiscordInjections is open-source under the MIT license.

Copyright 2017 stupid cat

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Disclaimer

DiscordInjections is not responsible for any plugins created by a third party. Needless to say, running plugins can be ***extremely dangerous*** as it exposes your entire discord client, as well as localStorage.

Before adding a plugin, be sure to thoroughly check its code to see what it does.

Stay safe.