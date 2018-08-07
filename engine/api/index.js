exports.priorities = ['discord-injections', 'css']

exports.formats = {
  'discord-injections': require('./discord-injections'),
  css: require('./css')
}

exports.detectFormat = function detectFormat (pluginPath) {
  for (let fmt of exports.priorities) {
    const Provider = exports.formats[fmt]

    if (Provider.supports(pluginPath)) {
      return new Provider(pluginPath)
    }
  }

  throw new Error('Unsupported format!')
}

exports.loadFormat = function loadFormat (formatProvider, pluginPath) {
  const Provider = exports.formats[formatProvider]
  if (Provider.supports(pluginPath)) {
    return new Provider(pluginPath)
  }

  throw new Error('Unsupported format!')
}

Object.defineProperty(exports, 'defaultFormat', {
  get () {
    return exports.priorities[0]
  }
})
