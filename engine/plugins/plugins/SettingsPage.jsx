const React = require('react')
const { PureComponent } = React
const { dialog } = require('electron').remote
const { SettingsOptionDescription, SettingsOptionButton } = require('elements')
const List = require('./components/List')

module.exports = class SettingsPage extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      plugins: props.plugin.plugins
    }
  }

  addLocal () {
    const fname = dialog
      .showOpenDialog({
        title: 'Select a plugin',
        properties: ['openFile'],
        filters: [{ name: 'Plugin files', extensions: ['asar', 'json'] }]
      })
      .pop()

    this.props.plugin.addPlugin(fname)
    this.setState({
      plugins: this.props.plugin.plugins
    })
  }

  async setDisabled (idx, flag) {
    await this.props.plugin.disable(idx, flag)
    this.setState({
      plugins: this.props.plugin.plugins
    })
  }

  async delete (idx) {
    await this.props.plugin.delete(idx)
    this.setState({
      plugins: this.props.plugin.plugins
    })
  }

  render () {
    return (
      <div>
        <div className='DI-plugin-buttonBar'>
          <SettingsOptionButton
            text='Add new Plugin'
            onClick={() => this.addLocal()}
          />
        </div>
        <List
          disable={(idx, flag) => this.setDisabled(idx, flag)}
          delete={idx => this.delete(idx)}
          items={Array.from(this.state.manager.plugins.values())}
        />
      </div>
    )
  }
}
