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
      <label className='checkboxWrapper-2Yvr_Y'>
        <input
          type='checkbox'
          className='inputDefault-2tiBIA input-oWyROL inputDefault-3JxKJ2 input-3ITkQf'
          checked={this.state.checked}
          onChange={() => this.click()}
        />
        <div
          className={`checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4 checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs box-mmYMsp ${this.getProp()
            ? 'checked-2TahvT checked-3_4uQ9 DI-checkbox-checked'
            : 'DI-checkbox-unchecked'}`}
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
            <g fill='none' fillRule='evenodd'>
              <polyline
                stroke={this.getProp() ? '#7289da' : 'transparent'}
                strokeWidth='2'
                points='3.5 9.5 7 13 15 5'
              />
            </g>
          </svg>
        </div>
      </label>
    )
  }
}
