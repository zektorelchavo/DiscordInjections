const React = require('react')

module.exports = props => {
  return (
    <li className='tab'>
      <a
        className={`tab-link ${props.linkClassName} ${props.isActive
          ? 'active'
          : ''}`}
        onClick={event => {
          event.preventDefault()
          props.onClick(props.tabIndex)
        }}
      >
        <i className={`tab-icon ${props.iconClassName}`} />
        {props.title}
      </a>
    </li>
  )
}
