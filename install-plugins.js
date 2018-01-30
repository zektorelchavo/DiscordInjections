const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const Promise = require('bluebird');

const files = fs.readdirSync(path.join(__dirname, 'Plugins'));

Promise.each(files, npmInstall).then(() => {
    console.log('Done!');
    process.exit();
    return;
});

function npmInstall(name) {
    return new Promise((res) => {
        if (name === 'readme.md') {
            res();
            return;
        }
        console.log('*=== Installing:', name, '===*');
        const file = path.join(__dirname, 'Plugins', name);
        if (fs.statSync(file).isDirectory()) {
            childProcess.exec('npm install', {
                cwd: file,
                encoding: 'utf8'
            }, (err, sout, serr) => {
                if (err) console.error(err);
                if (sout) console.log(sout);
                if (serr) console.error(serr);
                res();
            });
        } else {
            console.log('File ' + name + ' was not a directory.');
            res();
        }
    });
}
