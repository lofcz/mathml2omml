// Text/attribute data is stored decoded (parse decodes entity references), so
// every value must be re-encoded on output — otherwise text like "a < b" or a
// quote inside an attribute produces malformed OMML that makes Word/PowerPoint
// show a repair prompt. U+200B is emitted as a numeric reference so the
// invisible placeholder (empty-base scripts) stays visible in the markup.
function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\u200B/g, '&#x200B;')
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function attrString(attribs) {
  const buff = []
  for (const key in attribs) {
    buff.push(`${key}="${escapeAttr(attribs[key])}"`)
  }
  if (!buff.length) {
    return ''
  }
  return ` ${buff.join(' ')}`
}

function stringify(buff, doc) {
  switch (doc.type) {
    case 'text':
      return buff + escapeText(doc.data)
    case 'tag': {
      const voidElement =
        doc.voidElement || (!doc.children.length && doc.attribs['xml:space'] !== 'preserve')
      buff += `<${doc.name}${doc.attribs ? attrString(doc.attribs) : ''}${voidElement ? '/>' : '>'}`
      if (voidElement) {
        return buff
      }
      return `${buff + doc.children.reduce(stringify, '')}</${doc.name}>`
    }
    case 'comment':
      buff += `<!--${doc.comment}-->`
      return buff
  }
}

export function stringifyDoc(doc) {
  return doc.reduce((token, rootEl) => token + stringify('', rootEl), '')
}
