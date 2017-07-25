const e = window.DI.React.createElement;

const { SettingsTitle, SettingsDescription } = window.DI.require('./Structures/Components');

class SettingsBase extends window.DI.React.Component {
    render() {
        return e('div', {},
            e(SettingsTitle, { text: this.props.title }),
            e('div', { className: 'flex-vertical' },
                e('div', { className: 'margin-bottom-40' },
                    e('div', { className: 'di-settings-menu-wrapper' },
                        e(this.props.component)
                    )
                )
            )
        );
    }
}

module.exports = SettingsBase;