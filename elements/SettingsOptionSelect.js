const React = require('react')
const e = React.createElement

const Base = require('./SettingsOptionBase')

class SettingsOptionSelect extends Base {
  constructor (props) {
    super(props)

    this.state = { value: this.getProp(), expanded: false, focusedIndex: null }
  }

  generateOptions () {
    let output = []
    let index = 0
    this.props.options.map(o => {
      const focused = this.state.focusedIndex === index
      output.push(e(
        'div',
        {
          className: `Select-option ${this.getProp() === o ? 'is-selected' : ''} ${focused ? 'is-focused' : ''}`,
          id: `react-select-5--option-${index}`,
          onClick: this.optionClick.bind(this, o),
          onMouseOver: this.optionHover.bind(this, index)
        },
        o
      ))
      index++
    })
    return output
  }

  documentClick () {
    this.setState({
      expanded: false
    })
    document.removeEventListener('click', this.state.bind)
    document.removeEventListener('keydown', this.state.keyBind)
  }

  keyDown (event) {
    if (this.props.options.length <= 0) return 
    switch (event.key) {
      case 'ArrowUp':
        this.moveIndex(true)
        break
      case 'ArrowDown':
        this.moveIndex(false)
        break
      case 'Enter':
        this.setProp(this.props.options[this.state.focusedIndex])
        this.setState({ 
          value: this.getProp(),
          expanded: false
        })
        this.documentClick()
        break
    }
    event.preventDefault()
  }

  render () {
    return e(
      'div',
      { className: 'select-3JqNgs' },
      e(
        'div',
        { className: `Select Select--single has-value ${this.state.expanded ? 'is-focused is-open' : ''}` },
        e(
          'div',
          {
            className: 'Select-control',
            onClick: this.selectClick.bind(this)
          },
          e(
            'span',
            { className: 'Select-multi-value-wrapper', id: 'react-select-5--value' },
            e(
              'div',
              { className: 'Select-value' },
              e(
                'span',
                { className: 'Select-value-label', id: 'react-select-5--value-item' },
                this.getProp()
              )
            ),
            e(
              'div',
              {
                className: 'Select-input',
                style: {
                  border: '0px',
                  width: '1px',
                  display: 'inline-block'
                }
              }
            )
          ),
          e(
            'span',
            { className: 'Select-arrow-zone' },
            e(
              'span',
              { className: 'Select-arrow' }
            )
          )
        ),
        this.state.expanded ? e(
          'div',
          { className: 'Select-menu-outer' },
          e(
            'div',
            { className: 'Select-menu', id: 'react-select-5--list' },
            ...this.generateOptions()
          )
        ) : undefined
      )
    )
  }

  moveIndex (isUp) {
    let nextIndex = this.state.focusedIndex
    nextIndex += isUp ? -1 : 1
    if(nextIndex < 0) nextIndex = this.props.options.length - 1
    if(nextIndex >= this.props.options.length) nextIndex = 0
    this.setState({
      focusedIndex: nextIndex
    })
    this._reactInternalFiber.child.stateNode.querySelector(`#react-select-5--option-${this.state.focusedIndex}`).scrollIntoViewIfNeeded(false)
  }

  optionClick (option, event) {
    this.setProp(option)
    this.setState({ 
      value: this.getProp(),
      expanded: false
    })
    if (this.props.onChange) this.props.onChange(event)
  }

  optionHover (index) {
    this.setState({ 
      focusedIndex: index
    })
  }

  componentDidUpdate() {
    if(this.state.expanded && this.state.focusedIndex === this.props.options.indexOf(this.getProp()))
      this._reactInternalFiber.child.stateNode.querySelector('.is-selected').scrollIntoView(false)
  }


  selectClick () {
    if(this.state.expanded) return
    this.setState({
      expanded: true,
      focusedIndex: this.props.options.indexOf(this.getProp())
    })
    this.state.bind = this.documentClick.bind(this)
    this.state.keyBind = this.keyDown.bind(this)
    document.addEventListener('click', this.state.bind)
    document.addEventListener('keydown', this.state.keyBind)
  }
}

module.exports = SettingsOptionSelect
