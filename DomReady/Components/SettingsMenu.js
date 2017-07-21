const e = window.DI.React.createElement;

const SettingsSection = require('./SettingsSection');
const SettingsDivider = require('./SettingsDivider');
const SettingsSync = require('./SettingsSync');
const SettingsCSS = require('./SettingsCSS');

const StaticComponents = [
    { title: 'CSS', component: SettingsCSS },
    { title: 'Settings Sync', component: SettingsSync }
];

const DynamicComponents = [];

function GetComponents() {
    let output = [];

    for (const comp of [].concat(StaticComponents, DynamicComponents)) {
        output.push(e(SettingsSection, comp));
        output.push(e(SettingsDivider));
    }

    return output;
}

class SettingsMenu extends window.DI.React.Component {
    render() {
        return e('div', {},
            e('h2',
                { className: 'h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh2-37e5HZ marginBottom20-2Ifj-2' },
                'Discord Injections Settings'
            ),
            e('div', { className: 'flex-vertical' },
                e('div', { className: 'margin-bottom-40' },
                    e('h5', { className: 'h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH margin-bottom-4' },
                        'Choose your poison'
                    ),
                    e('div', { className: 'ui-form-item' },
                        e('div')
                    ),
                    e('div', { className: 'di-settings-menu-wrapper' },
                        ...GetComponents()
                    )
                )
            )
        );
    }
}

module.exports = SettingsMenu;