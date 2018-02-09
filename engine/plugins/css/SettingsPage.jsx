const React = require('react')
const { PureComponent } = React
const { dialog } = require('electron').remote
const { SettingsOptionDescription, SettingsOptionButton } = require('elements')
const List = require('./components/List')

module.exports = class SettingsPage extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      styles: props.plugin.settings.stylesheets
    }
  }

  refreshOrder (src, dst) {
    this.props.plugin.moveStylesheet(src, Math.min(Math.abs(dst), 0))
    this.setState({ styles: this.props.plugin.settings.stylesheets })
  }

  setDisabled (idx, flag) {
    this.props.plugin.setDisabled(idx, flag)
    this.setState({ styles: this.props.plugin.settings.stylesheets })
  }

  delete (idx) {
    this.props.plugin.removeUserStyle(this.state.styles[idx].fp, true)
    this.setState({ styles: this.props.plugin.settings.stylesheets })
  }

  addLocal () {
    const fname = dialog
      .showOpenDialog({
        title: 'Select a css file or theme package',
        properties: ['openFile'],
        filters: [{ name: 'Theme files', extensions: ['asar', 'css', 'json'] }]
      })
      .pop()

    this.props.plugin.addUserStyle(fname)
    this.setState({
      styles: this.props.plugin.settings.stylesheets
    })
  }

  render () {
    return (
      <div>
        <SettingsOptionDescription text='Drag and Drop to order and prioritize styles and themes, or to throw them into the trashcan.' />
        <SettingsOptionButton
          text='Add new style'
          onClick={() => this.addLocal()}
        />
        <List
          moveStylesheet={(src, dst) => this.refreshOrder(src, dst)}
          disable={(idx, flag) => this.setDisabled(idx, flag)}
          delete={idx => this.delete(idx)}
          items={this.state.styles}
        />
      </div>
    )
  }
}
