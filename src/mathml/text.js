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
    if (
      targetParent.children.length &&
      targetParent.children[targetParent.children.length - 1].type === 'text'
    ) {
      targetParent.children[targetParent.children.length - 1].data += text
    } else {
      targetParent.children.push({
        type: 'text',
        data: text
      })
    }
  }
  return targetParent
}
