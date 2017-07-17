/**
 * A file that loads the CSS injectors and plugins. Do not modify this.
 */

global.Promise = require('bluebird');

const DI = window.DI;
const CommandHandler = require('./CommandHandler');
const CssInjector = require('./CssInjector');
const PluginManager = require('./PluginManager');
const StateWatcher = require('./StateWatcher');
DI.StateWatcher = new StateWatcher();

DI.Helpers = new (require('./Helpers'))();

if (!DI.localStorage.getItem('customCss')) {
    DI.localStorage.setItem('customCss', window._path.join(window._injectDir, 'CSS', 'style.css'));
}

DI.CssInjector = new CssInjector();
DI.PluginManager = new PluginManager();
DI.CommandHandler = new CommandHandler();
DI.require = (path) => {
    return require('../' + path);
};