const React = require('react')
const e = React.createElement

class SettingsOptionDescription extends React.Component {
  render () {
    let extra = this.props.extra || []
    return (
      <div className='description-3MVziF formText-1L-zZB note-UEZmbY marginTop4-2rEBfJ modeDefault-389VjU primary-2giqSn marginBottom20-2Ifj-2 description-3_Ncsb formText-3fs7AJ modeDefault-3a2Ph1 primary-jw0I4K'>
        {this.props.text}
        {extra}
      </div>
    )
  }
}

module.exports = SettingsOptionDescription
