const React = require('react')
const e = React.createElement

class SettingsOptionTitle extends React.Component {
  render () {
    return (
      <h3
        className='h3-gDcP8B title-1pmpPr marginReset-3hwONl size16-3IvaX_ height24-2pMcnc weightMedium-13x9Y8 defaultColor-v22dK1 title-3i-5G_ marginReset-3hwONl flexChild-1KGW5q titleDefault-a8-ZSr title-31JmR4 marginReset-236NPn weightMedium-2iZe9B size16-14cGz5 height24-3XzeJx flexChild-faoVW3'
        style={{
          flex: '1 1 auto'
        }}
      >
        {this.props.text}
      </h3>
    )
  }
}

module.exports = SettingsOptionTitle
