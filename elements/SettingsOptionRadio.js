const React = require('react')
const e = React.createElement

const Base = require('./SettingsOptionBase')

class SettingsOptionRadio extends Base {
  constructor (props) {
    super(props)

    this.state = { value: this.getProp() }
  }

  generateItems () {
    return this.props.items.map(i => {
      const selected = this.getProp() === i
      return e(
        'div',
        {
          className: 'item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC',
          style: {
            padding: '10px',
            borderColor: selected ? 'rgb(114, 137, 218)' : '',
            backgroundColor: selected ? 'rgb(114, 137, 218)' : ''
          },
          onClick: this.click.bind(this, i)
        },
        e(
          'label',
          { className: 'checkboxWrapper-2Yvr_Y' },
          e(
            'input',
            {
              className: 'inputDefault-2tiBIA input-oWyROL',
              type: 'checkbox',
              value: 'on'
            }
          ),
          e(
            'div',
            {
              className: `checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4 ${selected ? 'checked-2TahvT' : ''}`,
              style: selected ? { borderColor: 'rgb(114, 137, 218)' } : {}
            },
            e(
              'svg',
              {
                name: 'Checkmark',
                width: 18,
                height: 18,
                viewBox: "0 0 18 18"
              },
              e(
                'g',
                {
                  fill: 'none',
                  fillRule: 'evenodd'
                },
                e(
                  'polyline',
                  {
                    stroke: selected ? '#7289da' : 'transparent',
                    strokeWidth: 2,
                    points: '3.5 9.5 7 13 15 5'
                  }
                )
              )
            )
          )
        ),
        e(
          'div',
          { className: 'info-1Z508c' },
          e(
            'div',
            {
              className: `${selected ? 'titleChecked-3Ngoss' : ''} title-1M-Ras`,
              style: selected ? { color: 'rgb(255, 255, 255)'} : {}
            },
            i
          )
        )
      )
    })
  }

  render () {
    return e(
      'div',
      { className: 'radioGroup-2P3MJo' },
      ...this.generateItems()
    )
  }

  click (i, event) {
    this.setProp(i)
    this.setState({
      value: this.getProp()
    })
    if (this.props.onChange) this.props.onChange(event)
  }
}

module.exports = SettingsOptionRadio
