const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const files = fs.readdirSync(path.join(__dirname, 'Plugins'));
let promise;
for (let name of files) {
    if (!promise) promise = npmInstall(name);
    else promise.then(() => npmInstall(name));
}
promise.then(() => {
    console.log('Done!');
    process.exit();
    return;
});

function npmInstall(name) {
    return new Promise((res, rej) => {
        console.log('*=== Installing:', name, '===*');
        const file = path.join(__dirname, 'Plugins', name);
        if (fs.lstatSync(file).isDirectory()) {
            let stdout = '', stderr = '';
            const child = childProcess.exec('npm install', {
                cwd: file,
                encoding: 'utf8'
            }, (err, sout, serr) => {
                if (err) console.error(err);
                if (stdout) console.log(stdout);
                if (stderr) console.error(stderr);
                child.removeAllListeners();
                res();
            });

            child.stdout.on('data', chunk => {
                stdout += chunk;
            });
            child.stdout.on('end', () => {
                console.log(stdout);
                stdout = '';
            });

            child.stderr.on('data', chunk => {
                stderr += chunk;
            });
            child.stderr.on('end', () => {
                console.error(stderr);
                stderr = '';
            });
        }
    });
}