const e = window.DI.React.createElement;
const Plugin = require('../Plugin');

class SettingsOptionBase extends window.DI.React.Component {
    constructor(props) {
        super(props);
        if (!props.hasOwnProperty('plugin') || !(props.plugin instanceof Plugin)) {
            throw new Error('Settings Components must have a valid plugin property!');
        }
    }

    get name() {
        return this.props.plugin.constructor.name;
    }

    getProp() {
        let entry = {};
        try {
            entry = JSON.parse(window.DI.localStorage.getItem('DI-' + this.name)) || {};
        } catch (err) {
            entry = {};
        }
        let nodes = this.props.lsNode.split('.');
        let current = entry;
        let update = false;
        for (let i = 0; i < nodes.length - 1; i++) {
            if (current[nodes[i]] === undefined || current[nodes[i]] === null) {
                current[nodes[i]] = {};
                update = true;
            } else {
                current = current[nodes[i]];
            }
        }
        if (!current.hasOwnProperty(nodes[nodes.length - 1])) {
            current[nodes[nodes.length - 1]] = this.props.defaultValue;
            update = true;
        }
        if (update)
            window.DI.localStorage.setItem('DI-' + this.name, JSON.stringify(entry));

        return current[nodes[nodes.length - 1]];
    }

    setProp(newVal) {
        let entry = {};
        try {
            entry = JSON.parse(window.DI.localStorage.getItem('DI-' + this.name));
        } catch (err) { }
        let nodes = this.props.lsNode.split('.');
        let current = entry;
        let update = false;
        for (let i = 0; i < nodes.length - 1; i++) {
            if (current[nodes[i]] === undefined || current[nodes[i]] === null) {
                current[nodes[i]] = {};
                update = true;
            } else {
                current = current[nodes[i]];
            }
        }
        current[nodes[nodes.length - 1]] = newVal;
        window.DI.localStorage.setItem('DI-' + this.name, JSON.stringify(entry));
    }
}

module.exports = SettingsOptionBase;
