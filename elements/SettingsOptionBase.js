const React = require('react')

class SettingsOptionBase extends React.PureComponent {
  constructor (props) {
    super(props)

    if (
      !props.virtual &&
      (!props.hasOwnProperty('plugin') ||
        !(props.plugin instanceof require('./index').Plugin))
    ) {
      throw new Error(
        'Settings Components must have a valid plugin property or be declared virtual!'
      )
    }
  }

  get plugin () {
    return this.props.plugin
  }

  getProp () {
    if (this.props.virtual) {
      return this.value != null ? this.value : this.props.defaultValue
    }

    return this.plugin.getSettingsNode(
      this.props.lsNode,
      this.props.defaultValue
    )
  }

  setProp (newVal) {
    let result = newVal
    if (this.props.virtual) {
      this.value = newVal
    } else {
      result = this.plugin.setSettingsNode(this.props.lsNode, newVal)
    }
    if (typeof this.props.onSave === 'function') this.props.onSave(newVal)
    return result
  }
}

module.exports = SettingsOptionBase
