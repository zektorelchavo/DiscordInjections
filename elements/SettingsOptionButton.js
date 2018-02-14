const React = require('react')

const e = React.createElement

class SettingsButton extends React.Component {
  get brandClass () {
    return 'button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u'
  }

  get outlineClass () {
    return 'button-2t3of8 lookOutlined-1c5nhl colorRed-3HTNPV sizeSmall-3g6RX8 grow-25YQ8u'
  }

  render () {
    return e(
      'button',
      {
        className: this.props.outline ? this.outlineClass : this.brandClass,
        type: 'button',
        onClick: this.props.onClick,
        style: {
          flex: '0 1 auto'
        }
      },
      e(
        'div',
        {
          className: 'contents-4L4hQM'
        },
        this.props.text
      )
    )
  }
}

module.exports = SettingsButton
