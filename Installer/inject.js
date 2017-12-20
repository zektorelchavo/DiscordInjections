const electron = require('electron');
const fs = require('fs');
const path = require('path');
const Module = require('module');

const base = require('./base');

const preloadPath = path.join(base, '..', 'Preload', 'index.js').replace(/\\/g, '/');
const domPath = path.join(base, '..', 'DomReady', 'inject.js').replace(/\\/g, '/');
let conf = {};

try {
    conf = JSON.parse(fs.readFileSync(path.join(base, '..', 'config.json')));
} catch (err) {
    console.log('[Injector] Could not load the config.');
}

// patch app path
const root = path.join(__dirname, '..', 'app.asar');
electron.app.getAppPath = () => root;

const oldLoader = Module._extensions['.js'];
let monkeyPatcher = 0;

// fetch package.json
const pkg = require(path.join(root, 'package.json'));
if (pkg.main.indexOf('app_bootstrap') >= 0) {
    console.log('[Injector] adding modern .js compiler');

    // app_bootstrap/appUpdater.js
    // app_boostrap/splashScreen.js
    // app_bootstrap/squirrelUpdate.js
    // app_bootstrap/autoStart.js
    // common/moduleUpdater.js

    Module._extensions['.js'] = (module, filename) => {
        let content = fs.readFileSync(filename, 'utf8');
        const shortname = filename.replace(root, '');

        if (filename.endsWith(`app_bootstrap${path.sep}splashScreen.js`)) {
            console.log('[Injector] patching splash screen...')
            content = content.replace('splashWindow = new _electron.BrowserWindow(windowConfig);', `
                splashWindow = new _electron.BrowserWindow(windowConfig);
                splashWindow.webContents.on('dom-ready', function () {
                    // TODO: setup style only injector
                });
            `);

            monkeyPatcher++;
        } else
        if (filename.endsWith(`app${path.sep}mainScreen.js`)) {
            console.log('[Injector] patching main window...')
            // preload script
            content = content.replace('webPreferences: {', `webPreferences: { preload: "${preloadPath}",`);

            // transparency
            if (conf.transparent) {
                content = content.replace('transparent: false,', 'transparent: true,')
                    .replace('backgroundColor: ACCOUNT_GREY,', '');
            }

            // native frame
            if (typeof conf.frame === 'boolean') {
                content = content.replace('frame: false,', `frame: ${conf.frame},`)
                    .replace('mainWindowOptions.frame = true;', `mainWindowOptions.frame = ${conf.frame};`);
            }

            content = content.replace('mainWindow.webContents.', `
                mainWindow.webContents.on('dom-ready', function () {
                    mainWindow.webContents.executeJavaScript(
                        'window._injectDir = "${path.join(base, '..').replace(/\\/g, '/')}";' +
                        require("fs").readFileSync('${domPath}', 'utf8')
                    );
                });mainWindow.webContents.`);

            monkeyPatcher++;
        }

        // TODO: find appropriate point to insert update survivor (app_boostrap/hostUpdater.js?)
        // TODO: set to 3 if update handler is found
        if (monkeyPatcher >= 2) {
            console.log('[Injector] all files patched, reverting to original loader');
            Module._extensions['.js'] = oldLoader;
        }

        return module._compile(content, filename);
    };
} else {
    console.log('[Injector] adding legacy .js compiler');
    Module._extensions['.js'] = (module, filename) => {
        let content = fs.readFileSync(filename, 'utf8');

        if (filename == path.join(root, 'index.js')) {
            console.log('[Injector] patching index.js');
            console.log('  ...injecting preloader...');
            content = content.replace('      webPreferences: {', [
                '      webPreferences: {',
                `        preload: "${preloadPath}",`
            ].join('\n'));

            if (conf.transparent) {
                console.log('  ...injecting transparency...');
                content = content.replace('transparent: false,', 'transparent: true,')
                    .replace('backgroundColor: ACCOUNT_GREY,', '');
            }

            if (typeof conf.frame === 'boolean') {
                console.log('  ...injecting frame...');
                content = content.replace('frame: false,', `frame: ${conf.frame},`)
                    .replace('mainWindowOptions.frame = true;', `mainWindowOptions.frame = ${conf.frame};`);
            }

            console.log('  ...injecting DOM...');
            content = content.replace('mainWindow.webContents.', `
                mainWindow.webContents.on('dom-ready', function () {
                    mainWindow.webContents.executeJavaScript(
                        'window._injectDir = "${path.join(base, '..').replace(/\\/g, '/')}";' +
                        _fs2.default.readFileSync('${domPath}', 'utf8')
                    );
                });mainWindow.webContents.`);
            monkeyPatcher++;
        }

        if (filename == path.join(root, 'SquirrelUpdate.js')) {
            console.log('[Injector] patching SquirrelUpdate.js');
            content = content.replace('app.once(\'will-quit\', function () {', `
                app.once('will-quit', function () {
                    require('${path.join(base, 'Installer', 'update.js').replace(/\\/g, '/')}')
                        (_path2.default.resolve(rootFolder, 'app-' + newVersion));`);
            monkeyPatcher++;
        }

        if (monkeyPatcher >= 2) {
            console.log('[Injector] all files patched, reverting to original loader');
            Module._extensions['.js'] = oldLoader;
        }

        return module._compile(content, filename);
    };
}

// rewrite root module
console.log('[Injector] loading discord!');
Module._load(path.join(root, pkg.main), null, true);
