/**
 * MathML `<mfrac>` → `m:f` (ECMA-376 §7.1.2.36) with `m:num` (§7.1.2.75) /
 * `m:den` (§7.1.2.28). `m:type@val` is ST_FType §7.1.3.4: bar | skw | lin | noBar.
 */
import { walker } from '../walker.js'

export function mfrac(element, targetParent, previousSibling, nextSibling, ancestors) {
  if (element.children.length !== 2) {
    // treat as mrow
    return targetParent
  }

  const numerator = element.children[0]
  const denumerator = element.children[1]
  const numeratorTarget = {
    name: 'm:num',
    type: 'tag',
    attribs: {},
    children: []
  }
  const denumeratorTarget = {
    name: 'm:den',
    type: 'tag',
    attribs: {},
    children: []
  }
  ancestors = [...ancestors]
  ancestors.unshift(element)
  walker(numerator, numeratorTarget, false, false, ancestors)
  walker(denumerator, denumeratorTarget, false, false, ancestors)
  // linethickness zero in any unit ("0", "0pt", "0.0") hides the fraction bar;
  // bevelled fractions map to the OMML "skewed" type.
  const linethickness = element.attribs?.linethickness?.trim()
  const fracType =
    linethickness !== undefined && /^0+(\.0*)?([a-z%]+)?$/i.test(linethickness)
      ? 'noBar'
      : element.attribs?.bevelled === 'true'
        ? 'skw'
        : 'bar'
  targetParent.children.push({
    type: 'tag',
    name: 'm:f',
    attribs: {},
    children: [
      {
        type: 'tag',
        name: 'm:fPr',
        attribs: {},
        children: [
          {
            type: 'tag',
            name: 'm:type',
            attribs: {
              'm:val': fracType
            },
            children: []
          }
        ]
      },
      numeratorTarget,
      denumeratorTarget
    ]
  })
  // Don't iterate over children in the usual way.
}
