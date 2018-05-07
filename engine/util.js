const { URL } = require('url')

exports.shortLink = function shortLink (longLink) {
  const link = new URL(longLink)

  if (link.protocol.startsWith('http')) {
    // remove https?://
    return longLink.substr(link.protocol.length + 2)
  }

  return longLink.href
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
