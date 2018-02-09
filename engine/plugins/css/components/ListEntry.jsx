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
    const pkg = entry.raw ? null : require(path.join(entry.fp, 'package.json'))

    return (
      <SettingsPanel>
        <div class='DI-css-infobox'>
          <SettingsOptionCheckbox
            virtual
            onSave={newVal => this.props.onDisable(!newVal)}
            defaultValue={!entry.disabled}
          />

          <div class='DI-css-meta'>
            <strong>
              {entry.raw ? path.basename(entry.name, '.css') : entry.name}
            </strong>

            <p>
              {entry.raw ? entry.name : pkg.description}
            </p>

            {entry.raw
              ? null
              : <div>
                {pkg.homepage
                    ? <span className='homepage'>
                      <a href={pkg.homepage} target='_BLANK'>
                        {this.shortLink(pkg.homepage)}
                      </a>
                    </span>
                    : null}
                <span className='license'>
                  {pkg.license || <i>Unkown</i>}
                </span>
                <span className='author'>
                  {pkg.author || <i>Unkown</i>}
                </span>
                {pkg.repository
                    ? <span className='repository'>
                      {this.repositoryLink(pkg.repository)}
                    </span>
                    : null}
              </div>}
          </div>

          <div>
            <SettingsOptionButton
              outline
              text='🗑'
              onClick={() => this.props.onDelete()}
            />
          </div>
        </div>
      </SettingsPanel>
    )
  }
}
