const React = require('react')
const e = React.createElement

class SettingsMultiSection extends React.PureComponent {
  constructor (props) {
    super(props)
  }

  generateSections () {
    return this.props.sections.map(s => {
      return e(
        'div',
        {
          className: 'flexChild-1KGW5q',
          style: { flex: '1 1 50%' }
        },
        s
      )
    })
  }

  render () {
    return e(
      'div',
      {
        className: 'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO margin-bottom-20',
          style: { flex: '1 1 auto' }
      },
      ...this.generateSections()
    )
  }
}

module.exports = SettingsMultiSection