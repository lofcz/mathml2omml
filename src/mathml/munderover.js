/** `<munderover>` → `m:nary` (§7.1.2.70) or nested `m:limUpp`/`m:limLow` (§7.1.2.56 / §7.1.2.54). */
import { getNary, getNaryTarget } from '../ooml/index.js'
import { walker } from '../walker.js'

export function munderover(element, targetParent, previousSibling, nextSibling, ancestors) {
  // Munderover
  if (element.children.length !== 3) {
    // treat as mrow
    return targetParent
  }

  ancestors = [...ancestors]
  ancestors.unshift(element)

  const base = element.children[0]
  const underscript = element.children[1]
  const overscript = element.children[2]

  //
  // m:nAry
  //
  // Conditions:
  // 1. base text must be nary operator
  // 2. no accents
  const naryChar = getNary(base)
  if (
    naryChar &&
    element.attribs?.accent?.toLowerCase() !== 'true' &&
    element.attribs?.accentunder?.toLowerCase() !== 'true'
  ) {
    const topTarget = getNaryTarget(naryChar, element, 'undOvr')
    element.isNary = true
    const subscriptTarget = {
      name: 'm:sub',
      type: 'tag',
      attribs: {},
      children: []
    }
    const superscriptTarget = {
      name: 'm:sup',
      type: 'tag',
      attribs: {},
      children: []
    }
    walker(underscript, subscriptTarget, false, false, ancestors)
    walker(overscript, superscriptTarget, false, false, ancestors)
    topTarget.children.push(subscriptTarget)
    topTarget.children.push(superscriptTarget)
    topTarget.children.push({ type: 'tag', name: 'm:e', attribs: {}, children: [] })
    targetParent.children.push(topTarget)
    return
  }

  // Fallback: m:limUpp()m:limlow

  const baseTarget = {
    name: 'm:e',
    type: 'tag',
    attribs: {},
    children: []
  }

  walker(base, baseTarget, false, false, ancestors)

  const underscriptTarget = {
    name: 'm:lim',
    type: 'tag',
    attribs: {},
    children: []
  }
  const overscriptTarget = {
    name: 'm:lim',
    type: 'tag',
    attribs: {},
    children: []
  }

  walker(underscript, underscriptTarget, false, false, ancestors)
  walker(overscript, overscriptTarget, false, false, ancestors)
  targetParent.children.push({
    type: 'tag',
    name: 'm:limUpp',
    attribs: {},
    children: [
      {
        type: 'tag',
        name: 'm:e',
        attribs: {},
        children: [
          {
            type: 'tag',
            name: 'm:limLow',
            attribs: {},
            children: [baseTarget, underscriptTarget]
          }
        ]
      },
      overscriptTarget
    ]
  })
  // Don't iterate over children in the usual way.
}
