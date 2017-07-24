const e = window.DI.React.createElement;

const { SettingsOptionToggle, SettingsExpandableSection, SettingsOptionButton,
    SettingsOptionDescription } = window.DI.require('./Structures/Components');


const Components = [
    {
        title: 'Enabled', component: SettingsOptionToggle,
        lsKey: 'DISettingsSync',
        lsNode: 'enabled',
        defaultValue: false
    },
    { text: 'These settings have no effect if Enabled is false.', component: SettingsOptionDescription },
    {
        title: 'Keybinds', component: SettingsOptionToggle,
        lsKey: 'DISettingsSync',
        lsNode: 'keybinds',
        defaultValue: true
    },
    {
        title: 'Emote Usage', component: SettingsOptionToggle,
        lsKey: 'DISettingsSync',
        lsNode: 'emoteUsage',
        defaultValue: true
    },
    {
        title: 'In Progress Messages', component: SettingsOptionToggle,
        lsKey: 'DISettingsSync',
        lsNode: 'inProgress',
        defaultValue: true
    },
    {
        title: 'Plugins', component: SettingsOptionToggle,
        lsKey: 'DISettingsSync',
        lsNode: 'plugins',
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
        if (window.DI.SettingsSync.token) comps = Components;
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
        return e(SettingsExpandableSection, { components: comps, title: 'Settings Sync - WIP' }, e('div', {}, 'hi'));
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