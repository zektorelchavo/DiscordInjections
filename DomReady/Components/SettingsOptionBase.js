const e = window.DI.React.createElement;

class SettingsOptionBase extends window.DI.React.Component {
    getProp() {
        let entry = {};
        try {
            entry = JSON.parse(window.DI.localStorage.getItem(this.props.lsKey)) || {};
        } catch (err) {
            entry = {};
        }
        if (!entry.hasOwnProperty(this.props.lsNode)) {
            entry[this.props.lsNode] = this.props.defaultValue;
            window.DI.localStorage.setItem(this.props.lsKey, JSON.stringify(entry));
        }
        return entry[this.props.lsNode];
    }

    setProp(newVal) {
        let entry = {};
        try {
            entry = JSON.parse(window.DI.localStorage.getItem(this.props.lsKey));
        } catch (err) { }
        entry[this.props.lsNode] = newVal;
        window.DI.localStorage.setItem(this.props.lsKey, JSON.stringify(entry));
    }
}

module.exports = SettingsOptionBase;