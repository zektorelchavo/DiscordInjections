/**
 * A file that loads the CSS injectors and plugins. Do not modify this.
 */

global.Promise = require('bluebird');

const DI = window.DI;
const CssInjector = require('./CssInjector');
const PluginManager = require('./PluginManager');
const StateWatcher = require('./StateWatcher');

if (!DI.localStorage.getItem('customCss')) {
    DI.localStorage.setItem('customCss', window._path.join(window._injectDir, 'CSS', 'style.css'));
}

DI.CssInjector = new CssInjector();
DI.PluginManager = new PluginManager();
DI.StateWatcher = new StateWatcher();