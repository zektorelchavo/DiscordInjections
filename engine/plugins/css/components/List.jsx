const React = require('react')
const { PureComponent } = React
const ListEntry = require('./ListEntry')

const { DragDropContext, Droppable, Draggable } = require('react-beautiful-dnd')

module.exports = class List extends PureComponent {
  onDragEnd ({ source, destination }) {
    if (!source || !destination) return
    this.props.moveStylesheet(source.index, destination.index)
  }

  render () {
    return (
      <DragDropContext onDragEnd={(...args) => this.onDragEnd(...args)}>
        <Droppable droppableId='styleList'>
          {(provided, snapshot) =>
            <ol
              ref={provided.innerRef}
              id='styleList'
              className={snapshot.isDraggingOver ? 'droppable' : ''}
            >
              {this.props.items.length
                ? this.props.items.map((entry, idx) =>
                  <Draggable
                    key={idx}
                    draggableId={'style-' + idx}
                    index={idx}
                    >
                    {(provided, snapshot) =>
                      <li>
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          >
                          <ListEntry
                            idx={idx}
                            entry={entry}
                            onDisable={flag => this.props.disable(idx, flag)}
                            onDelete={() => this.props.delete(idx)}
                            />
                          {provided.placeholder}
                        </div>
                      </li>}
                  </Draggable>
                  )
                : <li>
                  <i>No styles added!</i>
                </li>}
              {provided.placeholder}
            </ol>}
        </Droppable>
      </DragDropContext>
    )
  }
}
