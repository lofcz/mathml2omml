import * as entities from 'entities'

// Multi-line attribute values: quoted parts use [^"]* / [^']* (not lazy .*?)
// so values containing newlines parse correctly (html-parse-stringify#63).
const attrRE = /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?("[^"]*"|'[^']*')/g

export default function parseTag(tag, options = {}) {
  const res = {
    type: 'tag',
    name: '',
    voidElement: false,
    attribs: {},
    children: []
  }

  const tagMatch = tag.match(/<\/?([^\s]+?)[/\s>]/)
  if (tagMatch) {
    res.name = tagMatch[1]
    // XML adaptation: only explicitly self-closed tags are void — there is no
    // HTML void-element list (br, img, …) in MathML/OMML.
    if (tag.charAt(tag.length - 2) === '/') {
      res.voidElement = true
    }

    // handle comment tag
    if (res.name.startsWith('!--')) {
      const endIndex = tag.indexOf('-->')
      return {
        type: 'comment',
        comment: endIndex !== -1 ? tag.slice(4, endIndex) : ''
      }
    }
  }

  const reg = new RegExp(attrRE)
  let result = null
  for (;;) {
    result = reg.exec(tag)

    if (result === null) {
      break
    }

    if (!result[0].trim()) {
      continue
    }

    if (result[1]) {
      const attr = result[1].trim()
      let arr = [attr, '']

      if (attr.indexOf('=') > -1) {
        arr = attr.split('=')
      }

      res.attribs[arr[0]] = arr[1]
      reg.lastIndex--
    } else if (result[2]) {
      const value = result[3].trim().substring(1, result[3].length - 1)
      // Store attributes decoded, like text nodes — stringify re-encodes both.
      res.attribs[result[2]] = options.disableDecode ? value : entities.decodeXML(value)
    }
  }

  return res
}
