const React = require('react')

module.exports = class Tabs extends React.PureComponent {
  constructor (props, context) {
    super(props, context)
    this.state = {
      activeTabIndex: this.props.defaultActiveTabIndex || 0
    }
    this.handleTabClick = this.handleTabClick.bind(this)
  }

  handleTabClick (tabIndex) {
    this.setState({
      activeTabIndex:
        tabIndex === this.state.activeTabIndex
          ? this.props.defaultActiveTabIndex
          : tabIndex
    })
  }

  // Encapsulate <Tabs/> component API as props for <Tab/> children
  renderChildrenWithTabsApiAsProps () {
    return React.Children.map(this.props.children, (child, index) => {
      return React.cloneElement(child, {
        onClick: this.handleTabClick,
        tabIndex: index,
        isActive: index === this.state.activeTabIndex
      })
    })
  }

  // Render current active tab content
  renderActiveTabContent () {
    const { children } = this.props
    const { activeTabIndex } = this.state
    if (children[activeTabIndex]) {
      return children[activeTabIndex].props.children
    }
  }

  render () {
    return (
      <div className='tabs'>
        <ul className='tabs-nav'>
          {this.renderChildrenWithTabsApiAsProps()}
        </ul>
        <div className='tabs-active-content'>
          {this.renderActiveTabContent()}
        </div>
      </div>
    )
  }
}
