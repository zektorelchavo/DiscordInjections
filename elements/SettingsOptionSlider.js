const React = require('react')
const e = React.createElement

const Base = require('./SettingsOptionBase')

class SettingsOptionSlider extends Base {
  constructor (props) {
    super(props)

    this.state = { value: this.getProp() }
  }

  documentDrag (e) {
    const tRect = this._reactInternalFiber.child.stateNode.querySelector('.track-1h2wOF').getBoundingClientRect()
    const nextValue = Math.min(Math.max(((e.clientX-tRect.left)/tRect.width)*100, 0), 100);
    this.setProp(nextValue);
    this.setState({
      value: nextValue
    })
    if (this.props.onChange) this.props.onChange(event)
  }

  render () {
    return e(
      'div',
      { className: 'slider-2e2iXJ' },
      e(
        'input',
        {
          type: 'number',
          className: 'input-27JrJm',
          value: Math.round(this.getProp()),
          readOnly: true
        }
      ),
      e('div', { className: 'track-1h2wOF' }),
      e(
        'div',
        { className: 'bar-2cFRGz' },
        e(
          'div',
          {
            className: 'barFill-18ABna',
            style: { width: `${this.getProp()}%` }
          }
        )
      ),
      e(
        'div',
        { className: 'track-1h2wOF' },
        e(
          'div',
          {
            className: 'grabber-1TZCZi',
            style: { left: `${this.getProp()}%` },
            onMouseDown: this.grabberDown.bind(this)
          },
          this.props.bubble ? e(
            'div',
            { className: 'bubble-17BwqU elevationHigh-3lNfp9' },
            this.props.bubbleText ? this.props.bubbleText(this.getProp()) : `${Math.round(this.getProp())}%`
          ) : undefined
        )
      )
    )
  }

  grabberDown () {
    this.state.bind = this.documentDrag.bind(this)
    this.state.mouseBind = this.grabberUp.bind(this)
    document.addEventListener('mousemove', this.state.bind)
    document.addEventListener('mouseup', this.state.mouseBind)
  }

  grabberUp () {
    document.removeEventListener('mousemove', this.state.bind)
    document.removeEventListener('mouseup', this.state.mouseBind)
  }
}

module.exports = SettingsOptionSlider
