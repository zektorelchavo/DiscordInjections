const React = require('react')
const e = React.createElement

class SettingsOption extends React.Component {
  render () {
    return e(
      'div',
      { className: 'di-settings-option' },
      `Option: ${this.props.title}`
    )
  }
}

module.exports = SettingsOption
