/**
 * A file that loads the dom injection, do not modify this.
 */
window._path = require('path');
window._fs = require('fs');
window._injected = require(window._path.join(window._injectDir, 'DomReady', 'index.js'));
