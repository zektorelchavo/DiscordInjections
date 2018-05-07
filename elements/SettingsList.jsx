const React = require('react')
const { PureComponent } = React

module.exports = class List extends PureComponent {
  render () {
    if (this.props.length < 0 || !this.props.length) {
      return (
        <div className='list list-empty'>
          {this.props.noEntries || 'No entries found!'}
        </div>
      )
    }

    // generate ta list
    const list = []
    for (var idx = 0; idx < this.props.length; idx++) {
      const content = this.props.itemRenderer(idx)
      list.push(
        <li>
          {content}
        </li>
      )
    }

    return this.props.list === 'ordered'
      ? <ol className='list list-ordered'>
        {list}
      </ol>
      : <ul className='list'>
        {list}
      </ul>
  }
}
