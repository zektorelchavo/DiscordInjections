const e = window.DI.React.createElement;

const SettingsOptionToggle = require('./SettingsOptionToggle');

class SettingsSync extends window.DI.React.Component {
    render() {
        return e('div', { className: 'expandableSection-1QgO0O user-settings-notifications' },
            e(SettingsOptionToggle, { title: 'Keybinds' }),
            e(SettingsOptionToggle, { title: 'Emote Usage' }),
            e(SettingsOptionToggle, { title: 'In Progress Messages' }));
    }
}

module.exports = SettingsSync;