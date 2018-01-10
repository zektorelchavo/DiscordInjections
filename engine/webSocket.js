const { parse } = require('url')

class WebSocket extends window.WebSocket {
  constructor (url, protocols, ...args) {
    super(url, protocols, ...args)

    WebSocket.onCreate(this, url, protocols, ...args)
  }
}

WebSocket.onCreate = () => {}

window.WebSocket = WebSocket
