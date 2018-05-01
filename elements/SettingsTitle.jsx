const React = require('react')

const e = React.createElement

class SettingsTitle extends React.Component {
  render () {
    return (
      <h2 className='h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh2-2LTaUL marginBottom20-32qID7 h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh2-37e5HZ marginBottom20-2Ifj-2'>
        {this.props.text}
      </h2>
    )
  }
}

module.exports = SettingsTitle
