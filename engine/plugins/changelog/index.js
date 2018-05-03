const { Plugin } = require('elements')
const semver = require('semver')
const changelogData = require('../../../changelog')

module.exports = class changelog extends Plugin {
  preload () {
    this.registerCommand({
      name: 'changelog',
      info: 'Display the DI changelog',
      func: this.displayChangelog.bind(this)
    })
  }

  load () {
    const lastChangelog = this.getSettingsNode('lastChangelog', 0)
    if (lastChangelog === 0 || semver.lt(lastChangelog, this.DI.version)) {
      this.displayChangelog()
      this.setSettingsNode('lastChangelog', this.DI.version)
    }
  }

  get iconURL () {
    return '//discordinjections.xyz/img/logo.png'
  }

  displayChangelog () {
    let output = []

    let keys = Object.keys(changelogData).slice(0, 5)
    for (const version of keys) {
      output.push(
        `<h1 class="DI-changelog-added" ${version !== this.DI.version
          ? ''
          : 'style="margin-top: 0px !important"'}>Version ${version}</h1>`
      )

      for (const key in changelogData[version]) {
        output.push(`
          <h5>
            ${key}
          </h5>`)
        const changes = changelogData[version][key]
        if (Array.isArray(changes)) {
          output.push(
            `<ul>${changelogData[version][key]
              .map(k => `<li>${k}</li>`)
              .join('\n')}</ul>`
          )
        } else {
          output.push(`<p>${changes}</p>`)
        }
      }
    }

    this.manager.get('react').createModal(`<div class="DI-changelog">
        <div class="header" style="flex: 1 1 auto;">
            <h4>DiscordInjections Changelog</h4>
            <div class="version">Current Version: ${this.DI.version}</div>
        </div>
        <svg class="DI-modal-close-button" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>
      </div>
      <div class="DI-changelog-body">
        <div class="scroller">
          ${output.join('\n')}
        </div>
      </div>
`)
  }
}
