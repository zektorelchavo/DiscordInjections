class Command {
    constructor(plugin, options = {}) {
        this.plugin = plugin;
        if (options.name)
            this.name = options.name;
        else throw new Error('Cannot instantiate a command without a name!');
        this.info = options.info || 'A super cool command.';
        this.usage = options.usage || '';
        this.usage = this.usage.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        if (options.func) this.execOverride = options.func;
    }

    get header() {
        if (this.plugin)
            return this.plugin.name;
        else return '';
    }

    _execute(args) {
        if (this.execOverride) return this.execOverride(args);
        else return this.execute(args);
    }

    execute() {
        /* no-op */
    }
}

module.exports = Command;