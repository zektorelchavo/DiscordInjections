const SettingsDescription = require('./SettingsDescription');
const SettingsDivider = require('./SettingsDivider');
const SettingsOption = require('./SettingsOption');
const SettingsOptionTextbox = require('./SettingsOptionTextbox');
const SettingsOptionFilebox = require('./SettingsOptionFilebox');
const SettingsOptionToggle = require('./SettingsOptionToggle');
const SettingsOptionTitle = require('./SettingsOptionTitle');
const SettingsOptionDescription = require('./SettingsOptionDescription');
const SettingsOptionButton = require('./SettingsOptionButton');
const SettingsExpandableSection = require('./SettingsExpandableSection');
const SettingsSection = require('./SettingsSection');
const SettingsTitle = require('./SettingsTitle');

module.exports = {
    get SettingsDescription() { return SettingsDescription; },
    get SettingsDivider() { return SettingsDivider; },
    get SettingsOption() { return SettingsOption; },
    get SettingsOptionTextbox() { return SettingsOptionTextbox; },
    get SettingsOptionFilebox() { return SettingsOptionFilebox; },
    get SettingsOptionToggle() { return SettingsOptionToggle; },
    get SettingsOptionTitle() { return SettingsOptionTitle; },
    get SettingsOptionButton() { return SettingsOptionButton; },
    get SettingsOptionDescription() { return SettingsOptionDescription; },
    get SettingsExpandableSection() { return SettingsExpandableSection; },
    get SettingsSection() { return SettingsSection; },
    get SettingsTitle() { return SettingsTitle; }
};