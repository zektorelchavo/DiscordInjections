const React = require('react')
const { PureComponent } = React
const path = require('path')
const url = require('url')
const {
  SettingsOptionButton,
  SettingsOptionCheckbox,
  SettingsPanel
} = require('elements')

module.exports = class ListEntry extends PureComponent {
  shortLink (longLink) {
    const link = url.parse(longLink)
    if (link.protocol.substr(0, 4) === 'http') {
      link.protocol = null
      link.slashes = false
    }

    return url.format(link)
  }

  repositoryLink (longLink) {
    let link = longLink.url || longLink
    const parsed = url.parse(link)
    switch (parsed.protocol) {
      case 'github:':
        parsed.protocol = 'https:'
        parsed.path = parsed.pathname = parsed.host + parsed.path
        parsed.host = 'github.com'
        break
      case 'gist:':
        parsed.protocol = 'https:'
        parsed.path = parsed.pathname = parsed.host + parsed.path
        parsed.host = 'gist.github.com'
        break
      case 'bitbucket:':
        parsed.protocol = 'https:'
        parsed.path = parsed.pathname = parsed.host + parsed.path
        parsed.host = 'bitbucket.org'
        break
      case 'gitlab:':
        parsed.protocol = 'https'
        parsed.path = parsed.pathname = parsed.host + parsed.path
        parsed.host = 'gitlab.com:'
        break
    }

    return (
      <a href={url.format(parsed)} target='_BLANK'>
        {this.shortLink(link)}
      </a>
    )
  }

  render () {
    const { entry, index } = this.props

    return (
      <SettingsPanel>
        <div class='DI-plugin-infobox'>
          <SettingsOptionCheckbox
            virtual
            disabled={entry.dependency}
            onSave={newVal => this.props.onDisable(!newVal)}
            defaultValue={entry.loaded}
          />
          <div class='DI-plugin-meta'>
            <strong style={{ backgroundImage: `url(${entry.icon || 'https://discordinjections.xyz/img/logo-alt-nobg.svg'}` }}>
              {entry.package.name}
            </strong>

            <p>
              {entry.package.description}
            </p>

            <div>
              {entry.package.homepage
                ? <span className='homepage'>
                  <a href={entry.package.homepage} target='_BLANK'>
                    {this.shortLink(entry.package.homepage)}
                  </a>
                </span>
                : null}
              <span className='license'>
                {entry.package.license || <i>Unknown</i>}
              </span>
              <span className='author'>
                {entry.package.author || <i>Unknown</i>}
              </span>
              {entry.package.repository
                ? <span className='repository'>
                  {this.repositoryLink(entry.package.repository)}
                </span>
                : null}
            </div>
          </div>

          <div>
            {entry.dependency || entry.core
              ? null
              : <SettingsOptionButton
                outline
                text='🗑'
                onClick={() => this.props.onDelete()}
                />}
          </div>
        </div>
      </SettingsPanel>
    )
  }
}
