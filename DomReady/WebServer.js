/**
 * The Internal WebServer, do not modify this
 */


const http = require('http');
const lookup = require('mime-types').contentType

class WebServer {
    constructor() {
        this.server = http.createServer(this.onRequest.bind(this));
        // listen on localhost on a random port
        this.listen();

        this.paths = {};
    }

    get enabled() {
        let settings = {webServer: true}
        const diNode = DI.localStorage.getItem('DI-DiscordInjections');
        if (diNode) {
            try {
                // overwrite default with user setting
                settings = Object.assign(settings, JSON.parse(diNode));
            } catch (ex) {}

            return settings.webServer;
        }
    }

    get base() {
        const addr = this.server.address();
        return `http://${addr.address}:${addr.port}/`;
    }

    serve(path, location) {
        if (!this.enabled) {
            console.error('[WebServer] disabled, but asked to serve', path);
            return
        }

        // strip beginning ./ if needed
        if (path.startsWith('./')) {
            path = path.substr(2);
        }

        this.paths[path] = location;
        console.log('[WebServer] Serving', this.base + path, 'from', location);
    }

    listen() {
        if (!this.enabled && this.server.listening) {
            this.server.close();
            console.log('WebServer closed')
        } else if (!this.server.listening && this.enabled) {
            this.server.listen(0, 'localhost', () => {
                console.log('WebServer running on ' + this.base);
            });
        }
    }

    onRequest(req, res) {
        req.url = req.url.substr(1); // strip leading /

        if (!this.paths[req.url]) {
            console.log('[WebServer] 404', req.url);
            res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
            return res.end();
        }

        window._fs.readFile(this.paths[req.url], null, (err, data) => {
            if (err) {
                console.log('[WebServer] 500', req.url);
                res.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8', 'Access-Control-Allow-Origin': '*' });
                return res.end(err.toString(), 'utf-8');
            }

            console.log('[WebServer] 200', req.url);
            res.writeHead(200, { 'Content-Type': lookup(this.paths[req.url]) || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
            res.end(data);
        })
    }
}

module.exports = WebServer;