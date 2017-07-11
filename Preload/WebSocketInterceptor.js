/**
 * Intercepts the websocket before it is deleted
 * Also calls a function `window.onWebsocketReload` so that you can intercept any reloads.
 * Please implement this function.
 */

class WebSocket extends window.WebSocket {
    constructor(url, protocols) {
        super(url, protocols);

        if (url.includes('encoding')) {
            window.DI.ws = this;
            if (typeof window.DI.onWebsocketReload === 'function') {
                window.DI.onWebsocketReload(this);
            }
        }
    }
}

window.WebSocket = WebSocket;