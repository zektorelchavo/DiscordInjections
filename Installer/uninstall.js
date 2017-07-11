const path = require('path');
const fs = require('fs');
const asar = require('asar');
const childProcess = require('child_process');
const Installer = require('./util');
const ps = require('ps-node');
var appPath;
var isReinstall = false;

function closeClient(proc) {
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
            resolve(path.join(proc.command, '..', 'resources', 'original_app.asar'));
        } else {
            childProcess.exec('killall -9 ' + proc.command, (err, stdout, stderr) => {
                if (err) reject(err);
                resolve(path.join(proc.command, '..', 'resources', 'original_app.asar'));
            });
        }
    });
}

var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path) && path != '/') {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function restoreClient(_path) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(_path)) {
            const folder = path.join(_path, '..', 'app');
            console.log('Deleting the app folder...');
            deleteFolderRecursive(folder);
            console.log('Renaming the asar...');
            fs.renameSync(_path, path.join(_path, '..', 'app.asar'));
        } else console.log('ASAR does not exist, skipping...');
        resolve();
    });
}

function relaunchClient() {
    return new Promise((resolve, reject) => {
        if (isReinstall) {
            console.log('Not relaunching client yet, because reinstalling.');
        } else {
            console.log('Relaunching client...');
            let child = childProcess.spawn(appPath, { detached: true });
            child.unref();
        }
        resolve();
    });
}

module.exports = function (proc, reinstall = false) {
    isReinstall = reinstall;
    appPath = proc.command;
    return closeClient(proc)
        .then(restoreClient)
        .then(relaunchClient)
        .then(() => console.log('Uninstall complete.'))
        .catch(err => {
            console.error('An error has occurred. ' + err.message);
            return 1;
        });
};