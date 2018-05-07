exports.SettingsDescription = require('./SettingsDescription')
exports.SettingsDivider = require('./SettingsDivider')
exports.SettingsOption = require('./SettingsOption')
exports.SettingsOptionTextbox = require('./SettingsOptionTextbox')
exports.SettingsOptionFilebox = require('./SettingsOptionFilebox')
exports.SettingsOptionToggle = require('./SettingsOptionToggle')
exports.SettingsOptionTitle = require('./SettingsOptionTitle')
exports.SettingsOptionDescription = require('./SettingsOptionDescription')
exports.SettingsOptionButton = require('./SettingsOptionButton')
exports.SettingsExpandableSection = require('./SettingsExpandableSection')
exports.SettingsSection = require('./SettingsSection')
exports.SettingsTitle = require('./SettingsTitle')
exports.SettingsOptionCheckbox = require('./SettingsOptionCheckbox')
exports.SettingsPanel = require('./SettingsPanel')
exports.SettingsOptionSelect = require('./SettingsOptionSelect')
exports.SettingsOptionRadio = require('./SettingsOptionRadio')
exports.SettingsMultiSection = require('./SettingsMultiSection')
exports.SettingsFormNotice = require('./SettingsFormNotice')
exports.SettingsOptionSlider = require('./SettingsOptionSlider')
exports.SettingsGhostPill = require('./SettingsGhostPill')
exports.SettingsSubTitle = require('./SettingsSubTitle')
exports.SettingsTabs = require('./SettingsTabs')
exports.SettingsTab = require('./SettingsTab')
exports.SettingsList = require('./SettingsList')

// go as far up as possible
let m = module
while (m.parent && !m.filename.endsWith('pluginManager.js')) {
  m = m.parent
}

exports.Plugin = m.require('../components/plugin')
exports.Theme = require('./theme.js')
