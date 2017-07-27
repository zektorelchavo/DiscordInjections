const e = window.DI.React.createElement;

const { SettingsOptionToggle, SettingsExpandableSection, SettingsOptionButton,
    SettingsOptionDescription, SettingsDivider } = window.DI.require('./Structures/Components');


const Components = [
    {
        title: 'Enabled', component: SettingsOptionToggle,
        lsNode: 'sync.enabled',
        defaultValue: false
    },
    e(SettingsDivider),
    { text: 'These settings have no effect if Enabled is false.', component: SettingsOptionDescription },
    {
        title: 'Keybinds', component: SettingsOptionToggle,
        lsNode: 'sync.keybinds',
        defaultValue: true
    },
    e(SettingsDivider),
    {
        title: 'Emote Usage', component: SettingsOptionToggle,
        lsNode: 'sync.emoteUsage',
        defaultValue: true
    },
    e(SettingsDivider),
    {
        title: 'In Progress Messages', component: SettingsOptionToggle,
        lsNode: 'sync.inProgress',
        defaultValue: true
    },
    e(SettingsDivider),
    {
        title: 'Plugins', component: SettingsOptionToggle,
        lsNode: 'sync.plugins',
        defaultValue: true
    }
];

class SettingsSync extends window.DI.React.Component {
    constructor(props) {
        super(props);
        this.state = { attemptFailed: false };
    }

    render() {
        let comps = [];
        if (window.DI.SettingsSync.token) {
            comps = Components.map(c => {
                if (c.constructor.name === 'Object')
                    c.plugin = this.props.plugin;
                return c;
            });
        }
        else {
            comps.push({
                text: 'A DiscordInjections token and key have not been generated for you yet. Press the following button to generate them.'
                + 'This will simply DM the DiscordInjections bot with the message \'generate\'.',
                component: SettingsOptionDescription
            });

            if (this.state.attemptFailed) {
                comps.push(e(SettingsOptionDescription, {
                    text: 'You do not share a guild with the DiscordInjections bot. Please make sure you have DMs enabled, and join DTinker to use this feature: ',
                    extra: [e('a', { href: '//discord.gg/EDwd5wr', target: '_blank' }, 'discord.gg/EDwd5wr')]
                }));
            }

            comps.push({
                text: 'Generate Token',
                component: SettingsOptionButton, onClick: this.enableSync.bind(this)
            });
        }
        return e(SettingsExpandableSection, { components: comps, title: 'Settings Sync - WIP' });
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

module.exports = SettingsSync;