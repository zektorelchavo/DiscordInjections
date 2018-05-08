const { SettingsTitle } = require('../../../elements')
const React = require('react')
const { PureComponent } = React

module.exports = class SettingsBase extends PureComponent {
  render () {
    const { component: Component } = this.props

    return (
      <div>
        <SettingsTitle text={this.props.title} />
        <div className='flex-vertical'>
          <div className='margin-bottom-40'>
            <div
              className='di-settings-menu-wrapper'
              data-plugin={this.props.plugin._id}
              data-name={this.props.title}
              id={this.props.id}
            >
              <Component plugin={this.props.plugin} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
