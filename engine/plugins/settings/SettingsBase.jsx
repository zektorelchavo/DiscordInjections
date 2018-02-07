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
            <div className='di-settings-menu-wrapper'>
              <Component plugin={this.props.plugin} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
