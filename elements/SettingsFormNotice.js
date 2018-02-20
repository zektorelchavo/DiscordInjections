const React = require('react')
const e = React.createElement

class SettingsFormNotice extends React.PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    return e(
      'div',
      {
        className: 'formNotice-2tZsrh margin-bottom-40 cardPrimary-ZVL9Jr card-3DrRmC',
        style: { flex: '1 1 auto' }
      },
      e(
        'div',
        {
          className: 'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO',
          style: { flex: '1 1 auto' }
        },
        e(
          'img',
          {
            className: 'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO',
            style: { flex: '0 0 auto' },
            height: this.props.imageHeight || 40,
            src: this.props.image || '/assets/e8b66317ab0dc9ba3bf8d41a4f3ec914.png'
          }
        ),
        e(
          'div',
          {
            className: 'flexChild-1KGW5q',
            style: { flex: '1 1 auto' }
          },
          e(
            'h5',
            { className: 'h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH formNoticeTitle-1m5mND marginBottom4-_yArcI faded-1KRDbu' },
            this.props.title
          ),
          e(
            'div',
            { className: 'default-3bB32Y formText-1L-zZB formNoticeBody-1C0wup modeDefault-389VjU primary-2giqSn' },
            this.props.description
          )
        )
      )
    )
  }
}

module.exports = SettingsFormNotice