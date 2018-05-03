const React = require('react')
const { PureComponent } = React
const ListEntry = require('./ListEntry')

module.exports = class List extends PureComponent {
  onDragEnd ({ source, destination }) {
    if (!source || !destination) return
    this.props.moveStylesheet(source.index, destination.index)
  }

  render () {
    return (
      <ol id='styleList'>
        {this.props.items.length
          ? this.props.items.map((entry, idx) =>
            <li>
              <div>
                <ListEntry
                  idx={idx}
                  entry={entry}
                  onDisable={flag => this.props.disable(idx, flag)}
                  onDelete={() => this.props.delete(idx)}
                  />
              </div>
            </li>
            )
          : <li>
            <i>No styles added!</i>
          </li>}
      </ol>
    )
  }
}
