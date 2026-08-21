// ECMA-376 Part 1 §7.1.2.15 `m:brk` (CT_ManualBreak):
//   "line break at the start of a run, or at the start of the Box function"
//   parents: rPr (§7.1.2.91), boxPr (§7.1.2.14)
// There is no `m:br` in Office Math. `br` under `m:r` is WordprocessingML
// `w:br` (§2.3.3.1) via `w:EG_RunInnerContent` and is not a PPTX math child.

export const PENDING_BRK = Symbol('pendingBrk')

export function markLineBreak(targetParent) {
  targetParent[PENDING_BRK] = true
}

export function consumePendingBrk(targetParent, rElement) {
  if (!targetParent[PENDING_BRK]) return
  targetParent[PENDING_BRK] = false
  const brk = { name: 'm:brk', type: 'tag', attribs: {}, children: [] }
  let rPr = rElement.children.find((child) => child.name === 'm:rPr')
  if (!rPr) {
    rPr = { name: 'm:rPr', type: 'tag', attribs: {}, children: [] }
    const wrPrIndex = rElement.children.findIndex((child) => child.name === 'w:rPr')
    rElement.children.splice(wrPrIndex + 1, 0, rPr)
  }
  rPr.children.push(brk)
}

/** Wrap a non-run (fraction, radical, …) that follows a MathML newline. */
export function wrapLastChildInBreakBox(targetParent) {
  if (!targetParent[PENDING_BRK]) return
  const children = targetParent.children
  if (!children?.length) return
  const last = children[children.length - 1]
  if (last.name === 'm:r') return
  targetParent[PENDING_BRK] = false
  children[children.length - 1] = {
    name: 'm:box',
    type: 'tag',
    attribs: {},
    children: [
      {
        name: 'm:boxPr',
        type: 'tag',
        attribs: {},
        children: [{ name: 'm:brk', type: 'tag', attribs: {}, children: [] }]
      },
      {
        name: 'm:e',
        type: 'tag',
        attribs: {},
        children: [last]
      }
    ]
  }
}

export function mspace(element, targetParent) {
  if (element.attribs?.linebreak === 'newline') {
    markLineBreak(targetParent)
    return
  }
  targetParent.children.push({
    name: 'm:r',
    type: 'tag',
    attribs: {},
    children: [
      {
        name: 'm:t',
        type: 'tag',
        attribs: {
          'xml:space': 'preserve'
        },
        children: [
          {
            type: 'text',
            data: ' '
          }
        ]
      }
    ]
  })
}
