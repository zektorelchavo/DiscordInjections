const React = require('react')
const { PureComponent } = React
const { dialog } = require('electron').remote
const {
  SettingsTabs: Tabs,
  SettingsTab: Tab,
  SettingsOptionDescription,
  SettingsOptionButton
} = require('elements')

module.exports = class SettingsRepositoryPage extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      plugins: props.plugin.manager.plugins
    }
  }

  render () {
    return <div>Work in Progress!</div>
  }
}
