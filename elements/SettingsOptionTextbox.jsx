const React = require('react')
const e = React.createElement

const Base = require('./SettingsOptionBase')

const SettingsOptionTitle = require('./SettingsOptionTitle')
const SettingsOptionDescription = require('./SettingsOptionDescription')
const SettingsOptionButton = require('./SettingsOptionButton')

class SettingsOptionTextbox extends Base {
  constructor (props) {
    super(props)

    this.state = { value: this.getProp() }
  }

  render () {
    let titles = []

    if (this.props.title) {
      titles.push(
        <div
          className='flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO'
          style={{
            flex: '1 1 auto'
          }}
          key='title'
        >
          <SettingsOptionTitle text={this.props.title} />
        </div>
      )
    }

    if (this.props.description) {
      titles.push(
        <SettingsOptionDescription
          text={this.props.description}
          key='description'
        />
      )
    }

    const apply = this.props.apply
      ? <SettingsOptionButton text='Apply' onClick={this.apply.bind(this)} />
      : null
    const reset = this.props.reset
      ? <SettingsOptionButton
        outline
        text='Reset'
        onClick={this.reset.bind(this)}
        />
      : null

    return (
      <div>
        <div
          className='flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO switchItem-1uofoz'
          style={{ flex: '1 1 auto' }}
        >
          {titles}
        </div>

        <div className='flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO margin-bottom-20 flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStart-H-X2h- noWrap-3jynv6'>
          <input
            className='inputDefault-_djjkz input-cIJ7To size16-14cGz5 flexChild-faoVW3 inputDefault-Y_U37D input-2YozMi size16-3IvaX_ flexChild-1KGW5q'
            type={
              this.props.type
                ? this.props.type
                : this.props.password ? 'password' : 'text'
            }
            placeholder={
              this.props.defaultValue || this.props.placeholder || null
            }
            name={this.props.name || null}
            maxLength={this.props.maxlength || null}
            value={this.props.value}
            onChange={this.change.bind(this)}
            style={{
              flex: '1 1 auto',
              display: 'inline-block'
            }}
          />
          {apply}
          {reset}
        </div>
      </div>
    )
  }

  apply (event) {
    let value = this.state.value || this.props.defaultValue
    this.setProp(value)

    if (this.props.onApply) this.props.onApply(event)
  }

  change (event) {
    this.setState({ value: event.target.value })
    if (!this.props.apply) {
      this.setProp(event.target.value || this.props.defaultValue)
    }
  }

  reset (event) {
    this.setState({ value: '' })
    this.apply(event)
  }
}

module.exports = SettingsOptionTextbox
