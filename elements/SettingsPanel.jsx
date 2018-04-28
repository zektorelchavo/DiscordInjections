const React = require('react')

const e = React.createElement

class SettingsPanel extends React.PureComponent {
  render () {
    return (
      <div
        className='item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC item-26Dhrx marginBottom8-AtZOdT horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG cardPrimaryEditable-3KtE4g card-3Qj_Yx'
        style={{ padding: '10px', marginBottom: '10px' }}
      >
        {this.props.children}
      </div>
    )
  }
}

module.exports = SettingsPanel
