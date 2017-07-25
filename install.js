const Installer = require('./Installer');
const util = Installer.util;

util.getDiscordProcess().then((proc) => {
    var args = process.argv;
    switch (args[2]) {
        case 'inject':
            Installer.install(proc);
            break;
        case 'uninject':
            Installer.uninstall(proc);
            break;
        case 'reinject':
            Installer.reinstall(proc);
            break;
        default:
            console.log('Invalid command - valid commands are: inject, uninject, reinject');
            process.exit(0);
            break;
    }
}).catch(err => {
    console.log('No discord process was found. Please open your discord client and try again.');
    process.exit(0);
});

