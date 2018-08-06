const fs = require('fs-extra')
const buble = require('buble')

exports.run = conf => {
  // register custom extension compilation support
  require.extensions['.jsx'] = (module, filename) => {
    if (conf.debug) console.debug('[JSX] converting', filename)

    const raw = fs.readFileSync(filename, 'utf8')

    const transformed = buble.transform(raw, {
      jsx: 'React.createElement',
      objectAssign: 'Object.assign',
      target: { chrome: 52 }
    })
    return module._compile(transformed.code, filename)
  }
}
