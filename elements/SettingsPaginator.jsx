const React = require('react')

class SettingsPaginator extends React.PureComponent {
  changeTo (page) {
    this.props.onChange(page)
  }

  render () {
    if (this.props.pages === 1) {
      return null
    }

    const pages = []
    for (
      let i = this.props.current - this.props.wings;
      i <= this.props.current + this.props.wings;
      i++
    ) {
      if (i < 1 || i > this.props.pages) continue
      pages.push(i)
    }

    return (
      <div className='di-paginate'>
        <button
          onClick={() => this.changeTo(1)}
          className={{ disabled: this.props.current === 1 }}
        >
          &laquo;
        </button>
        <button
          onClick={() => this.changeTo(this.props.current - 1)}
          className={{ disabled: this.props.current === 1 }}
        >
          &lsaquo;
        </button>

        {pages.map(p =>
          <button
            key={p}
            onClick={() => this.changeTo(p)}
            className={{ active: p === this.props.page }}
          >
            {p}
          </button>
        )}

        <button
          onClick={() => this.changeTo(this.props.current + 1)}
          className={{ disabled: this.props.current === this.props.pages }}
        >
          &rsaquo;
        </button>
        <button
          onClick={() => this.changeTo(this.props.pages)}
          className={{ disabled: this.props.current === this.props.pages }}
        >
          &raquo;
        </button>
      </div>
    )
  }
}

module.exports = SettingsPaginator
