const e = window.DI.React.createElement;

const SettingsOptionTextbox = require('./SettingsOptionTextbox');

class SettingsCSS extends window.DI.React.Component {
    render() {
        return e('div', { className: 'expandableSection-1QgO0O' },
            e(SettingsOptionTextbox, {
                title: 'CSS Path',
                description: 'This is the path to your css files. Can either be absolute, or relative to the CSS folder.'
            })
        );
    }
}

module.exports = SettingsCSS;