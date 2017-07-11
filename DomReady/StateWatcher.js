const EventEmitter = require('eventemitter3');

class StateWatcher extends EventEmitter {
    constructor() {
        super();
        global.StateWatcher = this;
        this.observer = new MutationObserver(this._onMutation.bind(this));
        let mutation = { childList: true, subtree: true };
        this.observer.observe(document.querySelector(".app .layers"), mutation);
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
        }
    }

    _onMutation(muts) {
        console.log(muts);
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