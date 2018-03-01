const React = require('react')

const e = React.createElement

class SettingsSubTitle extends React.Component {
  render () {
    return e(
      'h5',
      {
        className:
          'h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4'
      },
      this.props.text
    )
  }
}

module.exports = SettingsSubTitle
