const React = require('react')
const e = React.createElement
const Base = require('./SettingsOptionBase')

module.exports = class SettingsOptionCheckbox extends Base {
  constructor (props) {
    super(props)

    this.state = {
      checked: this.getProp()
    }
  }

  click () {
    if (this.props.disabled) return
    this.setProp(!this.getProp())
    this.setState(() => ({
      checked: this.getProp()
    }))
  }

  render () {
    return (
      <label class='checkboxWrapper-2Yvr_Y'>
        <input
          type='checkbox'
          class='inputDefault-2tiBIA input-oWyROL'
          checked={this.state.checked}
          onClick={() => this.click()}
        />
        <div
          className={`checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4 ${this.getProp()
            ? 'checked-2TahvT'
            : ''}`}
          style={{
            borderColor: this.getProp() ? 'rgb(114, 137, 218)' : '',
            backgroundColor: this.props.disabled ? 'silver' : ''
          }}
        >
          <svg
            name='Checkmark'
            width='18'
            height='18'
            viewBox='0 0 18 18'
            xmlns='http://www.w3.org/2000/svg'
          >
            <g fill='none' fill-rule='evenodd'>
              <polyline
                stroke={this.getProp() ? '#7289da' : 'transparent'}
                stroke-width='2'
                points='3.5 9.5 7 13 15 5'
              />
            </g>
          </svg>
        </div>
      </label>
    )
  }
}
