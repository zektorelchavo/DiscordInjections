const EventEmitter = require('eventemitter3');

class StateWatcher extends EventEmitter {
    constructor() {
        super();
        this.observer = new MutationObserver(this._onMutation.bind(this));
        this.observe();
    }

    get settingsTabs() {
        return {
            'User Settings': 'userSettings',
            'My Account': 'userAccount',
            'Privacy & Safety': 'privacySettings',
            'Authorized Apps': 'authorizedApps',
            'Connections': 'connections',
            'Discord Nitro': 'nitro',
            'App Settings': 'appSettings',
            'Voice': 'voiceSettings',
            'Overlay': 'overlaySettings',
            'Notifications': 'notificationSettings',
            'Keybindings': 'keybindingSettings',
            'Games': 'gameSettings',
            'Text & Images': 'messageSettings',
            'Appearance': 'appearanceSettings',
            'Streamer Mode': 'streamerSettings',
            'Language': 'languageSettings',
            'Change Log': 'changelog',
            'Log Out': 'logout'
        };
    }

    observe() {
        this.observer.disconnect();
        let mutation = { childList: true, subtree: true };
        this.observer.observe(document.querySelector('.app .layers'), mutation);
        this.observer.observe(document.querySelector('html'), { attributes: true });
    }

    _onMutation(muts) {
        //console.log(muts);

        this.emit('mutation', muts);

        if (muts.length === 1 && muts[0].type === 'attributes' && muts[0].attributeName === 'lang') {
            this.emit('languageChange', muts[0].target.attributes.lang.value);
        }

        for (const mut of muts) {

            let changed = [];
            let added = true;
            if (mut.addedNodes.length > 0) {
                changed = mut.addedNodes;
            } else if (mut.removedNodes.length > 0) {
                changed = mut.removedNodes;
                added = false;
            } else {
                // NOTHING CHANGED?!?!?!11?!!?!?!?
                return;
            }

            //      console.log(changed);

            // Settings
            if (changed[0] && changed[0].classList && changed[0].classList.contains('layer')) {
                let node = changed[0];
                if (node.childNodes.length > 0) {
                    let child = node.childNodes[0];
                    if (child.className === 'ui-standard-sidebar-view') {
                        if (added) {
                            this.emit('settingsOpened', mut);

                        } else {
                            this.emit('settingsClosed', mut);
                        }
                    }
                }
            }
            else if (added && changed[0].parentNode && changed[0].parentNode.className === 'content-column default') {
                let element = document.querySelector('.layer .sidebar .selected-eNoxEK');
                let type = this.settingsTabs[element.innerText];
                if (type === undefined) type = 'unknown';
                this.emit('settingsTab', type, mut);
            }

            // Chat
            else if (changed[0] && changed[0].classList && changed[0].classList.contains('chat')) {
                if (added) {
                    this.emit('chatOpened', mut);
                } else {
                    this.emit('chatClosed', mut);
                }
            } else if (changed[0] && changed[0].classList && changed[0].classList.contains('channelTextArea-1HTP3C') && added) {
                this.emit('channelChanged', mut);
            }

            // FriendsList
            else if (changed[0].id === 'friends') {
                if (added) {
                    this.emit('friendsListOpened', mut);
                } else {
                    this.emit('friendsListClosed', mut);
                }
            }
        }
    }

}

module.exports = StateWatcher;