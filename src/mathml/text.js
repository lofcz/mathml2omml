/**
 * Character data may appear only in `m:t` (ECMA-376 §7.1.2.116), whose sole
 * math parent is `m:r` (§7.1.2.87). `m:e` is `CT_OMathArg` (§7.1.2.32):
 * `argPr` + `EG_OMathElements` + `ctrlPr` — no mixed content.
 */
export function ensureMathTextTarget(targetParent) {
  if (targetParent?.name === 'm:t') return targetParent
  if (!Array.isArray(targetParent.children)) targetParent.children = []
  const last = targetParent.children[targetParent.children.length - 1]
  if (last?.name === 'm:r') {
    const t = last.children[last.children.length - 1]
    if (t?.name === 'm:t') return t
  }
  const t = {
    name: 'm:t',
    type: 'tag',
    attribs: { 'xml:space': 'preserve' },
    children: []
  }
  targetParent.children.push({
    name: 'm:r',
    type: 'tag',
    attribs: {},
    children: [t]
  })
  return t
}

/** Character data for `m:t` (ECMA-376 §7.1.2.116). Invisible operators are stripped so they do not become boxes. */
export function text(element, targetParent, previousSibling, nextSibling, ancestors) {
  // Strip invisible operators (U+2061 function application, U+2062 invisible
  // times, U+2063 invisible separator, U+2064 invisible plus) and zero-width
  // spaces — Word renders them as unexpected boxes inside equations.
  let text = element.data.replace(/[\u2061-\u2064\u200B]/g, '')
  if (ancestors.find((element) => ['mi', 'mn', 'mo'].includes(element.name))) {
    text = text.replace(/\s/g, '')
  } else {
    const ms = ancestors.find((element) => element.name === 'ms')
    if (ms) {
      text = (ms.attribs?.lquote || '"') + text + (ms.attribs?.rquote || '"')
    }
  }
  if (text.length) {
    const dest = ensureMathTextTarget(targetParent)
    if (dest.children.length && dest.children[dest.children.length - 1].type === 'text') {
      dest.children[dest.children.length - 1].data += text
    } else {
      dest.children.push({
        type: 'text',
        data: text
      })
    }
    return dest
  }
  return targetParent
}
