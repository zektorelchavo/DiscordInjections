const React = require('react')
const { PureComponent } = React
const { dialog, getCurrentWindow } = require('electron').remote
const {
  SettingsList: List,
  SettingsOptionDescription,
  SettingsOptionButton,
  SettingsPanel,
  SettingsOptionCheckbox
} = require('elements')
const path = require('path')

const { shortLink, repositoryLink, parseAuthor } = require('../../util')

module.exports = class SettingsPluginPage extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      plugins: props.plugin.manager.plugins,
      count: props.plugin.manager.plugins.size
    }
  }

  async addLocal () {
    let fname = dialog
      .showOpenDialog({
        title: 'Select a plugin or theme',
        properties: ['openFile'],
        filters: [
          { name: 'Plugins & Themes', extensions: ['asar', 'json', 'css'] }
        ]
      })
      .pop()

    if (!fname) {
      return
    }

    const ext = path.extname(fname)
    if (ext === '.json') {
      fname = path.dirname(fname)
    }

    if (ext !== '.css') {
      await this.props.plugin.addPlugin(fname)
    } else {
      await this.props.plugin.addTheme(fname)
    }

    this.setState({
      count: this.props.plugin.manager.plugins.size
    })
  }

  async toggleDisable (id) {
    const enabled = this.props.plugin.isPluginEnabled(id)
    // is enabled => true, disable(true) disables ;D
    await this.props.plugin.disable(id, enabled)

    // force refresh pluginlist (hopefully)
    this.setState({
      count: this.props.plugin.manager.plugins.size
    })
  }

  async delete (id) {
    if (
      !dialog.showMessageBox(getCurrentWindow(), {
        type: 'question',
        title: 'Uninstall Plugin',
        message: `Do you really want to remove and uninstall "${this.state.plugins.get(
          id
        ).package.name}"?`,
        buttons: ['Yes', 'No'],
        defaultId: 1,
        cancelId: 1
      })
    ) {
      return
    }

    await this.props.plugin.delete(id)
    this.setState({
      count: this.props.plugin.manager.plugins.size
    })
  }

  renderItem (index) {
    const entry = Array.from(this.state.plugins.values())[index]

    const checkboxDisabled =
      this.props.plugin.isSystemPlugin(entry.id) ||
      entry.reverseDependency.length > 0

    const repoLink = entry.package.repository
      ? repositoryLink(entry.package.repository)
      : null
    const author = entry.package.author
      ? parseAuthor(entry.package.author)
      : null

    let debug = null
    if (this.props.plugin.debugEnabled) {
      const lines = `
          ID:                   ${entry.id}
          Load Path:            ${entry.path}
          Main:                 ${entry.main}
          L/L:                  ${entry.loading} / ${entry.loaded}
          Dependencies:         ${entry.dependency.join(',')}
          Reverse Dependencies: ${entry.reverseDependency.join(',')}
          Type:                 ${entry.package.type || 'plugin'}
      `.replace(/^\s+/gm, '')
      debug = (
        <div className='DI-plugins-debug'>
          {lines}
        </div>
      )
    }

    return (
      <SettingsPanel>
        <div className='DI-plugin-infobox' data-plugin-id={entry.id}>
          <SettingsOptionCheckbox
            virtual
            disabled={checkboxDisabled}
            onSave={newVal => this.toggleDisable(entry.id)}
            defaultValue={this.props.plugin.isPluginEnabled(entry.id)}
          />
          <div className='DI-plugin-meta'>
            <strong
              className={`DI-plugin-type-${entry.package.type || 'plugin'}`}
              style={{
                backgroundImage: `url(${entry.icon ||
                  'https://discordinjections.xyz/img/logo-alt-nobg.svg'}`
              }}
            >
              {entry.package.name}
            </strong>

            <p>
              {entry.package.description}
            </p>

            <div>
              {entry.package.homepage
                ? <span className='homepage'>
                  <a href={entry.package.homepage} target='_BLANK'>
                    {shortLink(entry.package.homepage)}
                  </a>
                </span>
                : null}
              <span className='license'>
                {entry.package.license || <i>Unknown</i>}
              </span>

              <span className='author'>
                {author
                  ? !author.hasLink
                    ? author.name
                    : <a href={author.url} target='_BLANK'>
                      {author.name}
                    </a>
                  : <i>Unknown</i>}
              </span>

              {repoLink
                ? <span className='repository'>
                  <a href={repoLink} target='_BLANK'>
                    {shortLink(repoLink)}
                  </a>
                </span>
                : null}
            </div>

            {debug}
          </div>

          <div>
            {checkboxDisabled
              ? null
              : <SettingsOptionButton
                outline
                className='DI-plugins-button-remove'
                text='🗑'
                onClick={() => this.delete(entry.id)}
                />}
          </div>
        </div>
      </SettingsPanel>
    )
  }

  render () {
    const renderer = this.renderItem.bind(this)
    return (
      <div>
        <div className='DI-plugins-header'>
          <SettingsOptionDescription>
            Install local plugins. If possible, prefer to install plugins from
            the repository instead. <br />
            This functionality will come with certain drawbacks and should be
            preferred to be only used for plugin development.
          </SettingsOptionDescription>

          <SettingsOptionButton
            text='Add new Plugin'
            className='DI-plugins-button-add'
            onClick={() => this.addLocal()}
          />
        </div>
        <List length={this.state.count} itemRenderer={renderer} />
      </div>
    )
  }
}
