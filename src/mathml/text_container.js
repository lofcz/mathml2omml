/**
 * Token elements → `m:r` / `m:t` (ECMA-376 §7.1.2.87 / §7.1.2.116).
 * `m:sty` is ST_Style §7.1.3.14 (`p|b|i|bi`); `m:nor` is §7.1.2.74.
 */
import { naryBaseArg } from '../ooml/index.js'
import { PENDING_BRK, consumePendingBrk } from './mspace.js'
import { getStyle } from './text_style.js'

const STYLES = {
  bold: 'b',
  italic: 'i',
  'bold-italic': 'bi'
}

function textContainer(element, targetParent, previousSibling, nextSibling, ancestors, textType) {
  if (!Array.isArray(targetParent.children)) targetParent.children = []
  if (previousSibling.isNary) {
    const e = naryBaseArg(targetParent)
    if (e) targetParent = e
  }

  const hasMglyphChild = element.children?.find((element) => element.name === 'mglyph')
  const style = getStyle(element, ancestors, previousSibling?.style)
  element.style = style // Add it to element to make it comparable
  element.hasMglyphChild = hasMglyphChild
  const styleSame =
    Object.keys(style).every((key) => {
      const previousStyle = previousSibling?.style
      return previousStyle && style[key] === previousStyle[key]
    }) && previousSibling?.hasMglyphChild === hasMglyphChild
  const sameGroup = // Only group mtexts or mi, mn, mo with oneanother.
    textType === previousSibling?.name ||
    (['mi', 'mn', 'mo'].includes(textType) && ['mi', 'mn', 'mo'].includes(previousSibling?.name))
  let targetElement
  const lastChild = targetParent.children[targetParent.children.length - 1]
  // Only append into an existing math run. Reusing `m:nary` / `m:e` here used
  // to dump character data into `m:e` (illegal CT_OMathArg / §7.1.2.32).
  if (
    sameGroup &&
    styleSame &&
    !hasMglyphChild &&
    !targetParent[PENDING_BRK] &&
    lastChild?.name === 'm:r'
  ) {
    const rElement = lastChild
    targetElement = rElement.children[rElement.children.length - 1]
  } else {
    const rElement = {
      name: 'm:r',
      type: 'tag',
      attribs: {},
      children: []
    }

    if (style.variant) {
      // CT_R (§7.1.2.87): m:rPr precedes the WordprocessingML w:rPr group.
      const mrPr = {
        name: 'm:rPr',
        type: 'tag',
        attribs: {},
        children: []
      }
      // CT_RPr (§7.1.2.91) is nor XOR EG_ScriptStyle(sty) — never both.
      // Variants without a ST_Style mapping (normal, fraktur, …) use plain
      // text (nor); the rest carry only sty.
      const styleValue = STYLES[style.variant]
      if (styleValue) {
        mrPr.children.push({
          name: 'm:sty',
          type: 'tag',
          attribs: {
            'm:val': styleValue
          },
          children: []
        })
      } else {
        mrPr.children.push({ name: 'm:nor', type: 'tag', attribs: {}, children: [] })
      }
      rElement.children.push(mrPr)
      const wrPr = {
        name: 'w:rPr',
        type: 'tag',
        attribs: {},
        children: []
      }
      if (style.variant.includes('bold')) {
        wrPr.children.push({ name: 'w:b', type: 'tag', attribs: {}, children: [] })
      }
      if (style.variant.includes('italic')) {
        wrPr.children.push({ name: 'w:i', type: 'tag', attribs: {}, children: [] })
      }
      if (wrPr.children.length) rElement.children.push(wrPr)
    } else if (hasMglyphChild || textType === 'mtext') {
      rElement.children.push({
        name: 'm:rPr',
        type: 'tag',
        attribs: {},
        children: [
          {
            name: 'm:nor',
            type: 'tag',
            attribs: {},
            children: []
          }
        ]
      })
    } else if (style.fontstyle === 'normal' || (textType === 'ms' && style.fontstyle === '')) {
      rElement.children.push({
        name: 'm:rPr',
        type: 'tag',
        attribs: {},
        children: [
          {
            name: 'm:sty',
            type: 'tag',
            attribs: { 'm:val': 'p' },
            children: []
          }
        ]
      })
    }

    targetElement = {
      name: 'm:t',
      type: 'tag',
      attribs: {
        'xml:space': 'preserve'
      },
      children: []
    }

    if (element.children.length < 1) {
      // Zero-width space placeholder; stringify emits it as &#x200B;
      targetElement.children.push({
        type: 'text',
        data: '\u200B'
      })
    }

    consumePendingBrk(targetParent, rElement)
    rElement.children.push(targetElement)
    targetParent.children.push(rElement)
  }
  return targetElement
}

export function mtext(element, targetParent, previousSibling, nextSibling, ancestors) {
  return textContainer(element, targetParent, previousSibling, nextSibling, ancestors, 'mtext')
}

export function mi(element, targetParent, previousSibling, nextSibling, ancestors) {
  return textContainer(element, targetParent, previousSibling, nextSibling, ancestors, 'mi')
}

export function mn(element, targetParent, previousSibling, nextSibling, ancestors) {
  return textContainer(element, targetParent, previousSibling, nextSibling, ancestors, 'mn')
}

export function mo(element, targetParent, previousSibling, nextSibling, ancestors) {
  return textContainer(element, targetParent, previousSibling, nextSibling, ancestors, 'mo')
}

export function ms(element, targetParent, previousSibling, nextSibling, ancestors) {
  return textContainer(element, targetParent, previousSibling, nextSibling, ancestors, 'ms')
}
