/**
 * A file that loads the CSS injectors and plugins. Do not modify this.
 */

global.Promise = require('bluebird');
const CssInjector = require('./CssInjector');
const PluginManager = require('./PluginManager');
const StateWatcher = require('./StateWatcher');

if (!window.$localStorage.getItem('customCss')) {
    window.$localStorage.setItem('customCss', window._path.join(window._injectDir, 'CSS', 'style.css'));
}

window._cssInjector = new CssInjector();
window._pluginManager = new PluginManager();

const watcher = new StateWatcher();