const React = require('react')

class SettingsButton extends React.Component {
  get brandClass () {
    return (
      'button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u' + // canary
      ' flexChild-1KGW5q buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra' +
      ' button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN'
    )
  }

  get outlineClass () {
    return (
      'button-2t3of8 lookOutlined-1c5nhl colorRed-3HTNPV sizeSmall-3g6RX8 grow-25YQ8u' + // canary
      ' flexChild-1KGW5q buttonRedOutlinedDefault-1VCgwL buttonOutlinedDefault-3FNQnZ buttonDefault-2OLW-v button-2t3of8 buttonOutlined-38aLSW buttonRedOutlined-2t9fm_' +
      ' button-38aScr lookOutlined-3sRXeN colorRed-1TFJan sizeSmall-2cSMqn grow-q77ONN'
    )
  }

  get brandContentsClass () {
    return 'contentsDefault-nt2Ym5 contentsFilled-3M8HCx'
  }

  get outlineContentsClass () {
    return 'contentsDefault-nt2Ym5 contentsOutlined-mJF6nQ'
  }

  render () {
    return (
      <button
        className={this.props.outline ? this.outlineClass : this.brandClass}
        type='button'
        onClick={this.props.onClick}
        style={{ flex: '0 1 auto' }}
      >
        <div
          className={
            'contents-18-Yxp contents-4L4hQM ' + this.props.outline
              ? this.outlineContentsClass
              : this.brandContentsClass
          }
        >
          {this.props.text}
        </div>
      </button>
    )
  }
}

module.exports = SettingsButton
