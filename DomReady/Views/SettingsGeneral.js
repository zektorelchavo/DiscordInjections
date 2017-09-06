const e = window.DI.React.createElement;

const { SettingsDivider, SettingsOptionTextbox, SettingsOptionFilebox, SettingsExpandableSection, SettingsOptionDescription, SettingsOptionToggle 
    } = window.DI.require('./Structures/Components');

class SettingsGeneral extends window.DI.React.Component {
    render() {
        return e('div', {},
            e(SettingsOptionFilebox, {
                title: 'CSS Path',
                description: 'This is the path to your css files. Can either be absolute, or relative to the CSS folder.',
                plugin: this.props.plugin,
                lsNode: 'cssPath',
                defaultValue: 'style.css',
                dialog: {
                    title: 'Select CSS file',
                    filters: [{ name: 'CSS Files', extensions: ['css'] }],
                },
                reset: true,
                apply: true,
                onApply: () => window.DI.CssInjector.refresh()
            }),
            e(SettingsDivider),
            e(SettingsOptionTextbox, {
                title: 'Custom Prefix',
                description: 'This is the prefix you\'ll use for custom commands.',
                plugin: this.props.plugin,
                lsNode: 'commandPrefix',
                defaultValue: '//',
                reset: true
            }),
            e(SettingsDivider),
            e(SettingsExpandableSection, { title: 'Expert settings', components: [
                e(SettingsOptionDescription, { 
                    text: 'Attention: These settings may break several things in your Discord Injections installation. ' +
                          'Make sure you know what you are doing!'
                }),
                e(SettingsOptionToggle, {
                    title: 'Internal Webserver',
                    description: 'This controls the internal webserver that is used as a wrapper around local file requests. If you don\'t use local imports, it is safe to disable.',
                    plugin: this.props.plugin,
                    lsNode: 'webServer',
                    defaultValue: true,
                    onSave: () => window.DI.WebServer.listen()
                }),
            ] }),
            e(require('./SettingsSync'), { title: 'Settings Sync', plugin: this.props.plugin })
        );
    }
}

module.exports = SettingsGeneral;