const React = require('react')
const { PureComponent } = React
const { dialog } = require('electron').remote
const {
  SettingsOptionTextbox: Textbox,
  SettingsOptionButton: Button,
  SettingsOptionSelect: Select,
  SettingsOptionTitle: OptionTitle,
  SettingsOptionDescription: Description,
  SettingsList: List,
  SettingsPanel
} = require('elements')
const { shortLink, repositoryLink, parseAuthor } = require('../../util')

const { json: npmFetch } = require('npm-registry-fetch')

module.exports = class SettingsRepositoryPage extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      keywords: 'di-plugin,di-theme',
      results: null
    }
  }

  componentDidMount () {
    setImmediate(() => this.updateList())
  }

  async updateList () {
    this.setState({ loading: true })
    const results = await npmFetch('/-/v1/search', {
      query: {
        size: 15,
        text: 'keywords:' + this.state.keywords
      }
    })
    this.setState({ loading: false, results })
  }

  onChangeSearch (value) {}

  onChangeFilter (value) {
    let keywords = 'di-plugin,di-theme'
    switch (value) {
      case 'Plugins':
        keywords = 'di-plugin'
        break
      case 'Themes':
        keywords = 'di-theme'
    }

    this.setState({ keywords }, () => this.updateList())
  }

  renderEntry (idx) {
    const entry = this.state.results.objects[idx]

    const repoLink = entry.package.repository
      ? repositoryLink(entry.package.repository)
      : null

    const author = entry.package.author
      ? parseAuthor(entry.package.author)
      : null

    let debug = null
    if (this.props.plugin.debugEnabled) {
      const lines = `
          Name:        ${entry.package.name}
          Version:     ${entry.package.verion}
          Repository:  ${repoLink}
      `.replace(/^\s+/gm, '')
      debug = (
        <div className='DI-plugins-debug'>
          {lines}
        </div>
      )
    }
    this.props.plugin.info(entry.package)
    return (
      <SettingsPanel>
        <div className='DI-plugin-infobox' data-plugin-id={entry.package.name}>
          <div className='DI-plugin-meta'>
            <strong>
              {entry.package.name} <em>v{entry.package.version}</em>
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

            {repoLink
              ? null
              : <div className='DI-plugin-warning'>
                <strong>
                    This package is missing an attached repository!
                  </strong>
                <br />
                  Some undefined behaviour might happen!
                </div>}

            {debug}
          </div>

          <div>TODO: The install button :)</div>
        </div>
      </SettingsPanel>
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
            <Description>Loading list...</Description>
          </div>
        )
      } else {
        content = (
          <List
            length={this.state.results.total}
            itemRenderer={idx => this.renderEntry(idx)}
          />
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
            onChange={val => this.onChangeSearch(val)}
          />
        </div>

        {content}
      </div>
    )
  }
}
