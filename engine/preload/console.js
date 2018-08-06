const fs = require('fs-extra')

exports.run = conf => {
  const fname = process.env.DI_DEBUG_LOG
  if (conf.debug) {
    for (let key of ['log', 'debug', 'info', 'warn', 'error']) {
      console['_' + key] = console[key].bind(console)
      console[key] = (...args) => {
        console['_' + key](...args)
        fs.appendFile(
          fname,
          `[${new Date().toISOString()}] {${key.toUpperCase()}} (render) ${args.join(
            ' '
          )}\n`,
          'utf8'
        )
      }

      process.on('uncaughtException', ev => {
        fs.appendFile(
          fname,
          `[${new Date().toISOString()}] {EEXCEPTION} (render) ${ev.error}\n`,
          'utf8'
        )
      })

      process.on('unhandledRejection', ev => {
        fs.appendFile(
          fname,
          `[${new Date().toISOString()}] {EREJECTION} (render) ${ev.reason}\n`,
          'utf8'
        )
      })

      window.addEventListener('error', ev => {
        fs.appendFile(
          fname,
          `[${new Date().toISOString()}] {EXCEPTION} ${ev.error}\n`,
          'utf8'
        )
      })

      window.addEventListener('unhandledrejection', ev => {
        fs.appendFile(
          fname,
          `[${new Date().toISOString()}] {REJECTION} ${ev.reason}\n`,
          'utf8'
        )
      })
    }
  }
}
