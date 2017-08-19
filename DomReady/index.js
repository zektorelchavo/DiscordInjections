/**
 * A file that loads the CSS injectors and plugins. Do not modify this.
 */

global.Promise = require('bluebird');

const DI = window.DI;
DI.Constants = require('./Constants');

DI.require = (path) => {
    return require('../' + path);
};

function load(fn, name = Math.random().toString()) {
    return window.webpackJsonp([name], { [name]: fn }, [name]);
}

load((m, e, r) => {
    let reactExtracted = false, reactDOMExtracted = false;
    for (const key in r.c) {
        let mod = r.c[key];
        if (mod.exports.hasOwnProperty('DOM') && mod.exports.hasOwnProperty('createClass')) {
            DI.React = mod.exports;
            reactExtracted = true;
            console.log('Found React!');
        } else if (mod.exports.hasOwnProperty('render')) {
            DI.ReactDOM = mod.exports;
            reactDOMExtracted = true;
            console.log('Found ReactDOM!');
        }

        if (reactExtracted && reactDOMExtracted) break;
    }
});

const CommandHandler = require('./CommandHandler');
const CssInjector = require('./CssInjector');
const PluginManager = require('./PluginManager');
const StateWatcher = require('./StateWatcher');
const SettingsSync = require('./SettingsSync');
const DISettings = require('./DISettings');
const WebServer = require('./WebServer')

DI.StateWatcher = new StateWatcher();
DI.DISettings = new DISettings();

DI.Helpers = new (require('./Helpers'))();

if (!DI.localStorage.getItem('customCss')) {
    DI.localStorage.setItem('customCss', window._path.join(window._injectDir, 'CSS', 'style.css'));
}

DI.SettingsSync = new SettingsSync();
DI.CssInjector = new CssInjector();
DI.PluginManager = new PluginManager();
DI.CommandHandler = new CommandHandler();
DI.WebServer = new WebServer();