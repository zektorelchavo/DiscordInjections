const e = window.DI.React.createElement;

const { SettingsOptionToggle, SettingsExpandableSection, SettingsOptionButton,
    SettingsOptionDescription, SettingsDivider, SettingsOptionTextbox } = window.DI.require('./Structures/Components');


class SettingsSyncPlugins extends SettingsOptionToggle {
    constructor(props) {
        super(props);
    }

    click() {
        super.click();
        if (this.state.checked) {
            window.DI.SettingsSync.initWS();
        } else window.DI.SettingsSync.destroy();
    }

    render() {
        let toggle = super.render();
        let plugins = [];
        if (this.state.checked) {
            for (const [key, plugin] of Object.entries(window.DI.PluginManager.plugins)) {
                try {
                    if (plugin.hasSettings)
                        plugins.push(e(SettingsOptionToggle, {
                            title: plugin.name, plugin: this.props.plugin,
                            lsNode: `sync.plugin.${key}`,
                            defaultValue: false
                        }));
                } catch (err) { console.error(err); }
            }
        }
        return e('div', {}, toggle, ...plugins);
    }

    enableSync() {
        window.DI.client.users.get(window.DI.Constants.DIBot).dmChannel.send('generate')
            .then(() => {
                setTimeout(() => {
                    this.forceUpdate();
                }, 1000);
            })
            .catch(err => {
                this.setState(prev => ({
                    attemptFailed: true
                }));
            });
    }
}

module.exports = SettingsSyncPlugins;