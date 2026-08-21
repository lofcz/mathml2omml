/** `<mglyph>` has no OMML counterpart; emit `alt` into `m:t` (§7.1.2.116). */
import { ensureMathTextTarget } from './text.js'

export function mglyph(element, targetParent, previousSibling, nextSibling, ancestors) {
  // No support in omml. Output alt text — only legal inside `m:t` (§7.1.2.116).
  if (element.attribs?.alt) {
    const dest = ensureMathTextTarget(targetParent)
    dest.children.push({
      type: 'text',
      data: element.attribs.alt
    })
  }
}
