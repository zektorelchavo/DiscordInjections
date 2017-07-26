const e = window.DI.React.createElement;

const { SettingsSection, SettingsDivider, SettingsOptionTextbox, SettingsOptionFilebox,
    SettingsTitle, SettingsDescription } = window.DI.require('./Structures/Components');

const StaticComponents = [
    { title: 'Settings Sync', component: require('./SettingsSync') }
];

function GetComponents() {
    let output = [];
    for (const comp of StaticComponents) {
        output.push(e(comp.component, comp));
        output.push(e(SettingsDivider));
    }
    return output;
}

class SettingsGeneral extends window.DI.React.Component {
    render() {
        return e('div', {},
            e(SettingsOptionFilebox, {
                title: 'CSS Path',
                description: 'This is the path to your css files. Can either be absolute, or relative to the CSS folder.',
                lsKey: 'DiscordInjections',
                lsNode: 'cssPath',
                defaultValue: 'style.css',
                reset: true,
                apply: true,
                onApply: () => window.DI.CssInjector.refresh()
            }),
            e(SettingsDivider),
            e(SettingsOptionTextbox, {
                title: 'Custom Prefix',
                description: 'This is the prefix you\'ll use for custom commands.',
                lsKey: 'DiscordInjections',
                lsNode: 'commandPrefix',
                defaultValue: '//',
                reset: true
            }),
            e(SettingsDivider),
            ...GetComponents()
        );
    }
}

module.exports = SettingsGeneral;