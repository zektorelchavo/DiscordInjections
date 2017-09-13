const e = window.DI.React.createElement;

const { SettingsOptionToggle, SettingsExpandableSection, SettingsOptionButton,
    SettingsOptionDescription, SettingsDivider, SettingsOptionTextbox } = window.DI.require('./Structures/Components');

const SettingsSyncPlugins = require('./SettingsSyncPlugins');

const Components = [
    { text: 'SettingsSync settings will not be synced.', component: SettingsOptionDescription },
    {
        title: 'Enabled', component: SettingsOptionToggle,
        lsNode: 'sync.enabled',
        defaultValue: false
    },
    {
        title: 'Sync Interval', component: SettingsOptionTextbox,
        description: 'The interval to sync settings at, in milliseconds. Defaults to 5 minutes.',
        lsNode: 'sync.interval',
        defaultValue: 5 * 60 * 1000,
        apply: true,
        onApply: () => {
            window.DI.SettingsSync.initWS();
        },
        reset: true,
        type: 'number'
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
        title: 'Plugins', component: SettingsSyncPlugins,
        lsNode: 'sync.plugins',
        defaultValue: true
    },
    e(SettingsDivider),
    { text: 'Dev settings - don\'t touch unless you know what you\'re doing!', component: SettingsOptionDescription },
    {
        title: 'Local WS', component: SettingsOptionToggle,
        lsNode: 'sync.localWs',
        defaultValue: false
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
            .catch(() => {
                this.setState(() => ({
                    attemptFailed: true
                }));
            });
    }
}

module.exports = SettingsSync;