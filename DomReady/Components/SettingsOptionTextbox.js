const e = window.DI.React.createElement;

class SettingsOption extends window.DI.React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: ''
        };
    }

    render() {
        let titles = [
            e('div', {
                className: 'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO',
                style: {
                    flex: '1 1 auto'
                }
            },
                e('h3', {
                    className: 'h3-gDcP8B title-1pmpPr marginReset-3hwONl size16-3IvaX_ height24-2pMcnc weightMedium-13x9Y8 defaultColor-v22dK1 title-3i-5G_ marginReset-3hwONl flexChild-1KGW5q',
                    style: {
                        flex: '1 1 auto'
                    }
                }, `${this.props.title}`)
            )
        ];
        if (this.props.description)
            titles.push(e('div', { className: 'description-3MVziF formText-1L-zZB note-UEZmbY marginTop4-2rEBfJ modeDefault-389VjU primary-2giqSn' },
                this.props.description
            ));

        return e('div', {}, e('div', {
            className: 'flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO switchItem-1uofoz marginBottom20-2Ifj-2',
            style: {
                flex: '1 1 auto'
            }
        },
            ...titles),
            e('input', {
                className: 'inputDefault-Y_U37D input-2YozMi size16-3IvaX_',
                type: this.props.password ? 'password' : 'text',
                placeholder: this.props.placeholder || undefined,
                name: this.props.name || undefined,
                maxlength: this.props.maxlength || undefined,
                value: this.props.value || undefined
            })
        );
    }
}

module.exports = SettingsOption;