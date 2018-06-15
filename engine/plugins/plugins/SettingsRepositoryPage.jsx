const React = require('react')
const { PureComponent } = React
const { dialog, getCurrentWindow } = require('electron').remote
const {
  SettingsOptionTextbox: Textbox,
  SettingsOptionButton: Button,
  SettingsOptionSelect: Select,
  SettingsOptionTitle: OptionTitle,
  SettingsOptionDescription: Description,
  SettingsList: List,
  SettingsPaginator: Paginator,
  SettingsPanel
} = require('elements')
const {
  shortLink,
  repositoryLink,
  parseAuthor,
  round,
  npmFetch
} = require('../../util')

const ResultsPerPage = 15

module.exports = class SettingsRepositoryPage extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      keywords: 'di-plugin,di-theme',
      results: null,
      search: '',
      plugins: props.plugin.manager.plugins,
      page: 0
    }
  }

  componentDidMount () {
    setImmediate(() => this.updateList())
  }

  async updateList () {
    this.setState({ loading: true })
    const text = 'keywords:' + this.state.keywords + ' ' + this.state.search
    this.props.plugin.debug(
      'Querying NPM with',
      text,
      'on page',
      this.state.page
    )
    const results = await npmFetch('/search', {
      query: {
        size: ResultsPerPage,
        from: ResultsPerPage * this.state.page,
        q: text
      }
    })
    this.setState({ loading: false, results })
  }

  onChangeSearch (value) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = null
    }

    this.searchTimeout = setTimeout(() => {
      this.props.plugin.debug('Setting searchterm to', value)
      this.setState({ search: value }, () => this.updateList())
    }, 500)
  }

  onChangeFilter (value) {
    let keywords = 'di-plugin,di-theme'
    switch (value) {
      case 'Plugins':
        keywords = 'di-plugin'
        break
      case 'Themes':
        keywords = 'di-theme'
    }

    this.props.plugin.debug('Setting keywords to', keywords)

    this.setState({ keywords }, () => this.updateList())
  }

  renderEntry (idx) {
    const entry = this.state.results.results[idx]
    console.log(idx, entry, this.state.results)

    const repoLink = entry.package.repository
      ? repositoryLink(entry.package.repository)
      : null

    const author = entry.package.author
      ? parseAuthor(entry.package.author)
      : null

    const alreadyInstalled = this.state.plugins.get(entry.package.name)

    let debug = null
    if (this.props.plugin.debugEnabled) {
      const lines = `
          Name:        ${entry.package.name}
          Version:     ${entry.package.version}
          Repository:  ${repoLink}
          Score:       ${round(entry.score.final)} (${round(
        entry.score.detail.quality
      )} / ${round(entry.score.detail.popularity)} / ${round(
        entry.score.detail.maintenance
      )})
          SScore:      ${round(entry.searchScore)}
      `.replace(/^\s+/gm, '')
      debug = (
        <div className='DI-plugins-debug'>
          {lines}
        </div>
      )
    }

    return (
      <SettingsPanel>
        <div className='DI-plugin-infobox' data-plugin-id={entry.package.name}>
          <div className='DI-plugin-meta'>
            
          <strong
            className={`DI-plugin-type-${entry.package.keywords.includes('di-theme') ? 'theme' : 'plugin'}`}
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
            {alreadyInstalled
              ? alreadyInstalled.package.version !== entry.package.version
                ? <Button
                  outline
                  className='DI-plugins-button-update'
                  onClick={() => this.install(entry.package, true)}
                />
                : null
              : <Button
                outline
                className='DI-plugins-button-install'
                text='➕'
                onClick={() => this.install(entry.package)}
                />}
          </div>
        </div>
      </SettingsPanel>
    )
  }

  async install (pkg, update = false) {
    if (
      dialog.showMessageBox(getCurrentWindow(), {
        type: 'question',
        title: `${update ? 'Update' : 'Install' } Plugin`,
        message: `Do you really want to ${update ? 'update' : 'install'} "${pkg.name}"?`,
        buttons: ['Yes', 'No'],
        defaultId: 0,
        cancelId: 1
      }) !== 0
    ) {
      return this.props.plugin.debug('Aborting', update ? 'update' : 'install', 'of', pkg.name)
    }

    this.props.plugin.debug(update ? 'Updating...' : 'Installing', pkg.name)

    // grab the package info
    const info = await npmFetch(
      'https://registry.npmjs.org/' + encodeURI(pkg.name)
    )
    this.setState({ loading: true }, async () => {
      await this.props.plugin.install(
        pkg.name,
        info.versions[info['dist-tags'].latest].dist.tarball,
        undefined,
        update
      )
      this.setState({
        loading: false,
        plugins: this.props.plugin.manager.plugins
      })
    })
  }

  changePage (page) {
    this.setState(
      {
        page: page - 1,
        loading: true
      },
      () => this.updateList()
    )
  }

  render () {
    let content = (
      <div className='DI-plugins-spinner'>
        <span className='spinner-2enMB9'>
          <span className='inner-1gJC7_'>
            <span className='wanderingCubesItem-WPXqao' />
            <span className='wanderingCubesItem-WPXqao' />
          </span>
        </span>

        <Description>Loading list...</Description>
      </div>
    )

    if (!this.state.loading) {
      if (!this.state.results || !this.state.results.total) {
        content = (
          <div className='DI-plugins-spinner'>
            <SettingsPanel>
              <Description>No results found!</Description>
            </SettingsPanel>
          </div>
        )
      } else {
        const len = Math.min(
          ResultsPerPage, // 25
          this.state.results.total - this.state.page * ResultsPerPage
        )
        content = (
          <div>
            <List length={len} itemRenderer={idx => this.renderEntry(idx)} />
            <Paginator
              pages={Math.ceil(this.state.results.total / ResultsPerPage)}
              onChange={page => this.changePage(page)}
              current={this.state.page + 1}
              wings={2}
            />
          </div>
        )
      }
    }

    return (
      <div>
        <div className='DI-plugins-header DI-plugins-flex'>
          <div>
            <div
              className='flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO'
              style={{
                flex: '1 1 auto'
              }}
              key='title'
            >
              <OptionTitle text='Type' />
            </div>
            <Select
              virtual
              options={['All', 'Plugins', 'Themes']}
              defaultValue={'All'}
              onChange={val => this.onChangeFilter(val)}
            />
          </div>

          <Textbox
            virtual
            title='Search'
            defaultValue=''
            onChange={val => this.onChangeSearch(val)}
          />
        </div>

        {content}
      </div>
    )
  }
}
