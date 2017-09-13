const e = window.DI.React.createElement;

const { SettingsTitle } = window.DI.require('./Structures/Components');

class SettingsBase extends window.DI.React.Component {
    render() {
        return e('div', {},
            e(SettingsTitle, { text: this.props.title }),
            e('div', { className: 'flex-vertical' },
                e('div', { className: 'margin-bottom-40' },
                    e('div', { className: 'di-settings-menu-wrapper' },
                        e(this.props.component, { plugin: this.props.plugin })
                    )
                )
            )
        );
    }
}

module.exports = SettingsBase;