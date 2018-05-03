const React = require('react')
const { PureComponent } = React
const ListEntry = require('./ListEntry')

module.exports = class List extends PureComponent {
  render () {
    return (
      <ol id='pluginList'>
        {this.props.items.length
          ? this.props.items.map((entry, idx) =>
            <li key={idx}>
              <ListEntry
                idx={idx}
                entry={entry}
                onDisable={flag => this.props.disable(idx, flag)}
                onDelete={() => this.props.delete(idx)}
                />
            </li>
            )
          : <li>
            <i>No plugins added!</i>
          </li>}
      </ol>
    )
  }
}
