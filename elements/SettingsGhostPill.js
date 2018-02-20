const React = require('react')
const e = React.createElement

class SettingsGhostPill extends React.Component {
  render () {
    return e(
      'h3',
      {
        className:
          'ghostPill-1yup5q cursorDefault-3ZQG0B flexChild-1KGW5q',
        style: {
          flex: '0 1 auto'
        }
      },
      this.props.text
    )
  }
}

module.exports = SettingsGhostPill
