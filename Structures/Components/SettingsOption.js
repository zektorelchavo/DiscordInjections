const e = window.DI.React.createElement;

class SettingsOption extends window.DI.React.Component {
    render() {
        return e('div', { className: 'di-settings-option' }, `Option: ${this.props.title}`);
    }
}

module.exports = SettingsOption;