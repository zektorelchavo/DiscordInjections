const React = require('react')

const e = React.createElement

class SettingsButton extends React.Component {
  get brandClass () {
    return 'button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u' // canary
        + ' flexChild-1KGW5q buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra'
  }

  get outlineClass () {
    return 'button-2t3of8 lookOutlined-1c5nhl colorRed-3HTNPV sizeSmall-3g6RX8 grow-25YQ8u' // canary
        + ' flexChild-1KGW5q buttonRedOutlinedDefault-1VCgwL buttonOutlinedDefault-3FNQnZ buttonDefault-2OLW-v button-2t3of8 buttonOutlined-38aLSW buttonRedOutlined-2t9fm_'
  } 
  
  get brandContentsClass () {
    return 'contentsDefault-nt2Ym5 contentsFilled-3M8HCx'
  }  

  get outlineContentsClass () {
    return 'contentsDefault-nt2Ym5 contentsOutlined-mJF6nQ'
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
          className: 'contents-4L4hQM ' + (this.props.outline
            ? this.outlineContentsClass  
            : this.brandContentsClass)
        },
        this.props.text
      )
    )
  }
}

module.exports = SettingsButton
