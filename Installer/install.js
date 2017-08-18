const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const Installer = require('./util');
const ps = require('ps-node');
const mkdirp = require('mkdirp');
var appPath;
var isReinstall = false;

const preloadPath = path.join(__dirname, '..', 'Preload', 'index.js').replace(/\\/g, '/');
const domPath = path.join(__dirname, '..', 'DomReady', 'inject.js').replace(/\\/g, '/');

function closeClient(proc, close) {
    if (!close) return new Promise((res => res(path.join(proc.command, '..', 'resources'))));
    return new Promise((resolve, reject) => {
        console.log('Closing client...');
        if (process.platform === 'win32') {
            for (const pid of proc.pid) {
                try {
                    process.kill(pid);
                } catch (err) {
                    console.error(err);
                }
            }
            resolve(path.join(proc.command, '..', 'resources'));
        } else {
            childProcess.exec('killall -9 ' + proc.command, (err, stdout, stderr) => {
                if (err) reject(err);
                resolve(path.join(proc.command, '..', 'resources'));
            });
        }
    });
}

function injectClient(_path) {
    return new Promise((resolve) => {
        console.log('Creating injector...');
        let dir = path.join(_path, 'app');
        mkdirp.sync(dir);
        const file = fs.readFileSync(path.join(__dirname, 'inject.js'), { encoding: 'utf8' });
        const pack = fs.readFileSync(path.join(__dirname, 'package.json.template'), { encoding: 'utf8' });
        fs.writeFileSync(path.join(dir, 'index.js'), file);
        fs.writeFileSync(path.join(dir, 'base.js'), `module.exports = '${__dirname.replace(/\\/g, '/')}';`);
        fs.writeFileSync(path.join(dir, 'package.json'), pack);

        let confDir = path.join(__dirname, '..', 'config.json');
        if (!fs.existsSync(confDir)) {
            const conf = fs.readFileSync(path.join(__dirname, 'config.json.template'), { encoding: 'utf8' });
            fs.writeFileSync(confDir, conf);
        }
        resolve();
    });
}

function relaunchClient() {
    return new Promise((resolve) => {
        console.log('Relaunching client');
        let child = childProcess.spawn(appPath, { detached: true });
        child.unref();
        resolve();
    });
}

module.exports = function (proc, close = true, reinstall = false) {
    appPath = proc.command;
    isReinstall = reinstall;
    return closeClient(proc, close)
        .then(injectClient)
        .then(relaunchClient)
        .then(() => console.log('Install complete.'))
        .catch(err => {
            if (err === false) return 0;
            console.error('An error has occurred. ' + err.stack);
            return 1;
        });
};