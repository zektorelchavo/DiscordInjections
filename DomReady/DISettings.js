const DI = window.DI;

const SettingsGeneral = require('./Views/SettingsGeneral');

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
        this.settingsTab.innerText = 'General Settings';
        this.settingsTab.onclick = this.settingsTabClicked.bind(this);

        this.header = document.createElement('div');
        this.header.className = 'header-1-f9X5';
        this.header.innerText = 'Discord Injections';

        this.divider = document.createElement('div');
        this.divider.className = 'separator-3z7STW marginTop8-2gOa2N marginBottom8-1mABJ4';

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
        if (this.settingsTabs.childNodes[0].innerHTML !== 'User Settings') return;
        this.settingsTab.className = this.unselectedCss;
        let header = this.settingsTabs.querySelectorAll('.separator-3z7STW')[3];
        this.settingsTabs.insertBefore(this.divider, header);
        this.settingsTabs.insertBefore(this.header, header);
        this.settingsTabs.insertBefore(this.settingsTab, header);
    }

    settingsTabClicked(e) {
        DI.StateWatcher.emit('settingsTab', 'discordInjections', {});
        DI.ReactDOM.render(DI.React.createElement(SettingsGeneral), document.querySelector('.layer .content-column div'));
    }
}

module.exports = DISettings;