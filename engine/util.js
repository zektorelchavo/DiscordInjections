const { parse, format, resolve } = require('url')
const { isString } = require('util')
const parseAuthor = require('parse-author')
const querystring = require('querystring')
// use node-fetch instead of window.fetch to ignore cors
const fetch = require('node-fetch')

exports.shortLink = function shortLink (longLink) {
  const link = parse(longLink)

  if (link.protocol.startsWith('http')) {
    // remove https?://
    return longLink.substr(link.protocol.length + 2)
  }

  return longLink
}

exports.repositoryLink = function repositoryLink (longLink) {
  let link = longLink.url || longLink
  let parsed = parse(link)

  switch (parsed.protocol) {
    case null:
    case 'github:':
      parsed.protocol = 'https:'
      parsed.host = 'github.com'
      break
    case 'gist:':
      parsed.protocol = 'https:'
      parsed.host = 'gist.github.com'
      break
    case 'bitbucket:':
      parsed.protocol = 'https:'
      parsed.host = 'bitbucket.org'
      break
    case 'gitlab:':
      parsed.protocol = 'https'
      parsed.host = 'gitlab.com:'
      break
  }

  return format(parsed)
}

exports.parseAuthor = function author (author) {
  if (!author) {
    return null
  }

  if (isString(author)) {
    author = parseAuthor(author)
  } else {
    author = Object.assign({}, author)
  }

  if (!author.url && author.email) {
    author.url = 'mailto:' + author.email
  }

  if (!author.name) {
    author.name = 'Unkown'
  }

  author.hasLink = !!author.url

  return author
}

exports.round = function round (num, digits = 2) {
  const exp = Math.pow(10, digits)
  const cut = Math.round(num * exp)
  return cut / exp
}

exports.npmFetch = async function npmFetch (url, options = {}) {
  if (url[0] === '/') {
    url = '/v2' + url
  }

  let fullUrl = resolve('https://api.npms.io', url)

  if (options.query) {
    const qs = querystring.stringify(options.query)
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs
  }

  const res = await fetch(fullUrl, options)
  if (res.status !== 200) {
    throw new Error('fetch returned ' + res.status + ' ' + res.statusText)
  }
  return res.json()
}
