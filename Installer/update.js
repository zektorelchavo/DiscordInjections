const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

module.exports = dir => {
    const injector = fs.readFileSync(path.join(__dirname, 'inject.js'));
    const pack = fs.readFileSync(path.join(__dirname, 'package-temp.json'));
    dir = path.join(dir, 'resources', 'app');
    mkdirp.sync(dir);
    fs.writeFileSync(path.join(dir, 'index.js'), injector);
    fs.writeFileSync(path.join(dir, 'package.json'), pack);
    fs.writeFileSync(path.join(dir, 'base.js'), `module.exports = '${path.join(__dirname)}';`);
};