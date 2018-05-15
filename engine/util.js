const { URL } = require('url')
const { isString } = require('util')
const parseAuthor = require('parse-author')

exports.shortLink = function shortLink (longLink) {
  const link = new URL(longLink)

  if (link.protocol.startsWith('http')) {
    // remove https?://
    return longLink.substr(link.protocol.length + 2)
  }

  return link.href
}

exports.repositoryLink = function repositoryLink (longLink) {
  let link = longLink.url || longLink
  let parsed = {}
  try {
    parsed = new URL(link)
  } catch (err) {
    parsed = new URL('github:' + link)
  }

  switch (parsed.protocol) {
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

  return parsed.href
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
