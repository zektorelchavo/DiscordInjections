const e = window.DI.React.createElement;

const SettingsOption = require('./SettingsOption');

class SettingsSync extends window.DI.React.Component {
    render() {
        return e('div', {},
            e(SettingsOption, { title: 'Keybinds' }),
            e(SettingsOption, { title: 'Emote Usage' }),
            e(SettingsOption, { title: 'In Progress Messages' }));
    }
}

module.exports = SettingsSync;