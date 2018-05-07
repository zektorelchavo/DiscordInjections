const React = require('react')
const { SettingsOptionTextbox } = require('elements')

module.exports = class SettingsGeneral extends React.PureComponent {
  render () {
    return (
      <div>
        <SettingsOptionTextbox
          title='Custom Prefix'
          description="This is the prefix you'll use for custom commands."
          plugin={this.props.plugin}
          lsNode='commandPrefix'
          defaultValue='//'
          reset
        />
      </div>
    )
  }
}
