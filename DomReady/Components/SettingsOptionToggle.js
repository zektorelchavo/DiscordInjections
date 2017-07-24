const e = window.DI.React.createElement;

class SettingsOption extends window.DI.React.Component {
    constructor(props) {
        super(props);

        this.state = {
            checked: this.props.checked === undefined ? false : this.props.checked
        };
    }

    click() {
        this.setState(prev => ({
            checked: !prev.checked
        }));
    }

    render() {
        return e('div', {
            className: 'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyBetween-1d1Hto alignCenter-3VxkQP noWrap-v6g9vO notifications-sound',
            style: {
                flex: '1 1 auto'
            }
        },
            e('div', {
                className: 'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO',
                style: {
                    flex: '0 1 auto'
                }
            },
                e('h3', {
                    className: 'h3-gDcP8B title-1pmpPr size16-3IvaX_ height24-2pMcnc weightMedium-13x9Y8 defaultColor-v22dK1 notifications-sound-text flexChild-1KGW5q',
                    style: {
                        flex: '1 1 auto'
                    }
                }, `${this.props.title}`)
            ),
            e('div', {
                className: 'flexChild-1KGW5q',
                style: {
                    flex: '0 1 auto'
                },
                onClick: this.click.bind(this)
            },
                e('div', {
                    className: 'switchWrapperDefaultActive-2IdHq2 switchWrapperDefault-3GSsCS switchWrapper-3sSQdm'
                },
                    e('input', {
                        type: 'checkbox',
                        className: 'checkbox-1KYsPm',
                        value: 'on'
                    }),
                    e('div', {
                        className: `switch-3lyafC ${this.state.checked ? 'checked-7qfgSb' : ''}`
                    })
                )
            )
        );
    }
}

module.exports = SettingsOption;