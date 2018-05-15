const React = require('react')

const Base = require('./SettingsOptionBase')
const Title = require('./SettingsOptionTitle')

class SettingsOptionToggle extends Base {
  constructor (props) {
    super(props)

    this.state = {
      checked: this.getProp()
    }
  }

  click () {
    this.setProp(!this.getProp())
    this.setState(() => ({
      checked: this.getProp()
    }))
  }

  render () {
    return (
      <div
        className='flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 margin-top-20 margin-bottom-20'
        style={{
          flex: '1 1 auto'
        }}
      >
        <div
          className='flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStart-H-X2h- noWrap-3jynv6'
          style={{
            flex: '1 1 auto'
          }}
        >
          <Title text={this.props.title} />
          <div
            className={
              'flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX ' +
              (this.state.checked
                ? 'valueChecked-m-4IJZ'
                : 'valueUnchecked-2lU_20')
            }
            onClick={() => this.click()}
            style={{
              flex: '0 0 auto'
            }}
          >
            <input
              type='checkbox'
              className='checkbox-2tyjJg checkboxEnabled-CtinEn checkbox-2tyjJg'
              value={this.state.checked}
            />
            <div
              className={
                'switch-3wwwcV ' + (this.state.checked ? 'checked-7qfgSb' : '')
              }
            />
          </div>
        </div>
      </div>
    )
  }
}

module.exports = SettingsOptionToggle
