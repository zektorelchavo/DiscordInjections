const DI = window.DI;

const SettingsMenu = require('./Components/SettingsMenu');

class DISettings {
    constructor() {
        DI.StateWatcher.on('settingsOpened', this.injectSettingsTab.bind(this));
        DI.StateWatcher.on('settingsTab', type => {
            if (type === 'discordInjections') {
                let element = document.querySelector('.layer .sidebar .selected-eNoxEK');
                element.className = this.unselectedCss;
                this.settingsTab.className = this.selectedCss;

            } else this.settingsTab.className = this.unselectedCss;
        });
        this.settingsTab = document.createElement('div');
        this.settingsTab.className = this.unselectedCss;
        this.settingsTab.innerText = 'Discord Injections';
        this.settingsTab.onclick = this.settingsTabClicked.bind(this);

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
        this.settingsTab.className = this.unselectedCss;
        let header = this.settingsTabs.querySelectorAll('.header-1-f9X5')[1];
        this.settingsTabs.insertBefore(this.settingsTab, header.nextSibling);
    }

    settingsTabClicked(e) {
        DI.StateWatcher.emit('settingsTab', 'discordInjections', {});
        DI.ReactDOM.render(DI.React.createElement(SettingsMenu), document.querySelector('.layer .content-column div'));
    }
}

module.exports = DISettings;