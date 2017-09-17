/**
 * Intercepts the localStorage variable before it is deleted.
 */

let localStorage = window.DI.localStorage = window.localStorage;

localStorage.constructor.prototype._setItem = localStorage.constructor.prototype.setItem;
localStorage.constructor.prototype.setItem = (...args) => {
    try {
        if (localStorage.getItem(args[0]) != args[1]) {
            let lastModified = localStorage.getItem('DI-LastModified');
            if (!lastModified) lastModified = {};
            else lastModified = JSON.parse(lastModified);
            lastModified[args[0]] = Date.now();
            localStorage._setItem('DI-LastModified', JSON.stringify(lastModified));
        }
    } catch (err) {
        console.error(err);
    }
    localStorage._setItem(...args);
};