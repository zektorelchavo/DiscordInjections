const DI = window.DI;

const SettingsGeneral = require('./Views/SettingsGeneral');
const SettingsBase = require('./Views/SettingsBase');
const Plugin = window.DI.require('./Structures/Plugin');

class DISettings {
    constructor() {
        const plugin = new (class DiscordInjections extends Plugin { })();
        DI.StateWatcher.on('languageChange', this.injectSettingsTab.bind(this));
        DI.StateWatcher.on('settingsOpened', this.injectSettingsTab.bind(this));
        DI.StateWatcher.on('settingsClosed', () => {
            for (const key in this.map) {
                this.map[key].tab.className = this.unselectedCss;
            }
        });
        DI.StateWatcher.on('settingsTab', type => {
            if (this.map.hasOwnProperty(type)) {
                let element = document.querySelector('.layer .sidebar .selected-eNoxEK');
                element.className = this.unselectedCss;
                this.map[type].tab.className = this.selectedCss;

                DI.ReactDOM.render(DI.React.createElement(SettingsBase, {
                    component: this.map[type].component,
                    plugin: this.map[type].plugin,
                    title: this.map[type].name
                }),
                    document.querySelector('.layer .content-column div'));

            } else {
                for (const key in this.map)
                    this.map[key].tab.className = this.unselectedCss;
            }
        });

        this.header = document.createElement('div');
        this.header.className = 'header-1-f9X5';
        this.header.innerText = 'Discord Injections';

        this.divider = document.createElement('div');
        this.divider.className = 'separator-3z7STW marginTop8-2gOa2N marginBottom8-1mABJ4';

        this.map = {};

        this.registerSettingsTab(plugin, 'General Settings', SettingsGeneral);
        console.log(this.map);
    }

    registerSettingsTab(plugin, name, component) {
        if (name && !component) { component = name; name = plugin ? plugin.name : 'undefined'; }

        let id = 'di-';
        if (plugin) id += plugin.name + '-';
        id += name;
        let tab = document.createElement('div');
        tab.className = this.unselectedCss;
        tab.innerText = name;
        tab.onclick = () => {
            DI.StateWatcher.emit('settingsTab', id);
        };

        this.map[id] = {
            tab, component, id, name, plugin
        };
    }

    get unselectedCss() {
        return 'itemDefault-3NDwnY item-3879bf notSelected-PgwTMa';
    }

    get selectedCss() {
        return 'itemDefaultSelected-1UAWLe item-3879bf selected-eNoxEK';
    }

    get settingsTabs() {
        return document.querySelector('.layer .sidebar .side-2nYO0F');
    }

    injectSettingsTab() {
        if (!this.settingsTabs || !document.querySelector('.itemBrand-mC9YR4')) return;

        const el = this.settingsTabs.querySelector('.itemDanger-3m3dwx');
        let header = el.previousElementSibling;
        this.settingsTabs.insertBefore(this.divider, header);
        this.settingsTabs.insertBefore(this.header, header);
        for (const key in this.map) {
            this.settingsTabs.insertBefore(this.map[key].tab, header);
        }
    }
}

module.exports = DISettings;
