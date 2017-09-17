const e = window.DI.React.createElement;

class SettingsDescription extends window.DI.React.Component {
    render() {
        return e('h5', {
            className: 'h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH margin-bottom-4'
        }, this.props.text);
    }
}

module.exports = SettingsDescription;