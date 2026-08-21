/**
 * ECMA-376 schema validation over real pipeline output.
 *
 * Child-order and enum rules are transcribed from Part 1 §7.1
 * (standards/ecma/part-27_shared-mls-reference-material-math.txt):
 * CT_Nary §7.1.2.70, CT_F §7.1.2.36, CT_Rad §7.1.2.88, CT_SSub §7.1.2.101,
 * CT_SSup §7.1.2.105, CT_SSubSup §7.1.2.103, CT_SPre §7.1.2.99, CT_Acc,
 * CT_Bar, CT_GroupChr, CT_LimLow/Upp, CT_M/MR §7.1.2.60/69, CT_RPr §7.1.2.91,
 * ST_OnOff §7.1.3.9, ST_FType §7.1.3.4, ST_LimLoc §7.1.3.8, ST_TopBot §7.1.3.15,
 * ST_Style §7.1.3.14, ST_Integer255 (m:count).
 */
import { mml2omml } from '../src/index.js'
import { parse } from '../src/parse-stringify/index.js'

// [required-order] with optional leading properties element.
const SEQUENCE = {
  'm:nary': ['m:naryPr', 'm:sub', 'm:sup', 'm:e'],
  'm:f': ['m:fPr', 'm:num', 'm:den'],
  'm:rad': ['m:radPr', 'm:deg', 'm:e'],
  'm:sSub': ['m:sSubPr', 'm:e', 'm:sub'],
  'm:sSup': ['m:sSupPr', 'm:e', 'm:sup'],
  'm:sSubSup': ['m:sSubSupPr', 'm:e', 'm:sub', 'm:sup'],
  'm:sPre': ['m:sPrePr', 'm:sub', 'm:sup', 'm:e'],
  'm:acc': ['m:accPr', 'm:e'],
  'm:bar': ['m:barPr', 'm:e'],
  'm:groupChr': ['m:groupChrPr', 'm:e'],
  'm:limLow': ['m:limLowPr', 'm:e', 'm:lim'],
  'm:limUpp': ['m:limUppPr', 'm:e', 'm:lim'],
  'm:box': ['m:boxPr', 'm:e']
}

const ARGS = ['m:e', 'm:num', 'm:den', 'm:deg', 'm:sub', 'm:sup', 'm:lim', 'm:fName']

const ENUMS = {
  'm:grow': ['on', 'off'],
  'm:subHide': ['on', 'off'],
  'm:supHide': ['on', 'off'],
  'm:degHide': ['on', 'off'],
  'm:plcHide': ['on', 'off'],
  'm:hideTop': ['on', 'off'],
  'm:hideBot': ['on', 'off'],
  'm:hideLeft': ['on', 'off'],
  'm:hideRight': ['on', 'off'],
  'm:strikeBLTR': ['on', 'off'],
  'm:strikeTLBR': ['on', 'off'],
  'm:strikeH': ['on', 'off'],
  'm:strikeV': ['on', 'off'],
  'm:limLoc': ['subSup', 'undOvr'],
  'm:type': ['bar', 'skw', 'lin', 'noBar'],
  'm:pos': ['top', 'bot'],
  'm:sty': ['p', 'b', 'i', 'bi']
}

export function validateOmml(omml, label) {
  const doc = parse(omml)
  const problems = []
  const walk = (node, path) => {
    if (node.type !== 'tag') {
      if (node.type === 'text' && node.data.trim()) {
        problems.push(`${path}: character data outside m:t (§7.1.2.116)`)
      }
      return
    }
    const here = `${path}/${node.name}`
    const spec = SEQUENCE[node.name]
    if (spec) {
      const names = node.children.filter((c) => c.type === 'tag').map((c) => c.name)
      // The leading *Pr element is optional; align both sides before comparing.
      const optionalPr = spec[0].endsWith('Pr')
      const rest = optionalPr && names[0] === spec[0] ? names.slice(1) : names
      const expectedRest = optionalPr ? spec.slice(1) : spec
      if (rest.join('|') !== expectedRest.join('|')) {
        problems.push(
          `${here}: child sequence [${names.join(', ')}] ≠ spec [${spec.join(', ')}] (optional ${spec[0]} may be omitted)`
        )
      }
    }
    if (ARGS.includes(node.name)) {
      for (const child of node.children) {
        if (child.type === 'tag') {
          const legal = [
            'm:argPr',
            ...Object.keys(SEQUENCE).concat(ARGS),
            'm:ctrlPr',
            'm:r',
            'm:t',
            'm:oMath',
            'm:oMathPara',
            'm:eqArr',
            'm:phant',
            'm:func'
          ]
          // EG_OMathElements plus structural wrappers; text nodes handled above.
          if (!legal.includes(child.name) && !child.name.startsWith('m:')) {
            problems.push(`${here}: non-math child <${child.name}> in CT_OMathArg`)
          }
        }
      }
    }
    if (node.name === 'm:r') {
      const names = node.children.filter((c) => c.type === 'tag').map((c) => c.name)
      if (!names.includes('m:t')) {
        problems.push(`${here}: run without m:t (§7.1.2.87 requires text)`)
      }
      // CT_R §7.1.2.87: rPr(m:rPr)?, w:EG_RPr?, content. m:rPr must precede w:rPr.
      const mIdx = names.indexOf('m:rPr')
      const wIdx = names.indexOf('w:rPr')
      if (mIdx !== -1 && wIdx !== -1 && mIdx > wIdx) {
        problems.push(`${here}: m:rPr must precede w:rPr (CT_R sequence)`)
      }
    }
    if (node.name === 'm:rPr') {
      const names = node.children.filter((c) => c.type === 'tag').map((c) => c.name)
      // CT_RPr: lit?, (nor | sty), brk?, aln?
      const filtered = names.filter((n) => n !== 'm:lit' && n !== 'm:brk' && n !== 'm:aln')
      if (filtered.length > 1 || (filtered[0] && !['m:nor', 'm:sty'].includes(filtered[0]))) {
        problems.push(`${here}: children [${names.join(', ')}] violate CT_RPr sequence`)
      }
      if (names.includes('m:nor') && names.includes('m:sty')) {
        problems.push(`${here}: nor and sty are a schema choice, not both (§7.1.2.91)`)
      }
    }
    if (node.name === 'm:mr') {
      const cells = node.children.filter((c) => c.type === 'tag' && c.name === 'm:e').length
      if (cells < 1) {
        problems.push(`${here}: row with no cells (CT_MR requires ≥1 e)`)
      }
    }
    const val = node.attribs?.['m:val']
    if (val !== undefined && ENUMS[node.name] && !ENUMS[node.name].includes(val)) {
      problems.push(`${here}: @m:val="${val}" not in {${ENUMS[node.name].join('|')}}`)
    }
    if (node.name === 'm:count') {
      const n = Number(val)
      if (!Number.isInteger(n) || n < 1 || n > 255) {
        problems.push(`${here}: count ${val} violates ST_Integer255`)
      }
    }
    node.children.forEach((child) => walk(child, here))
  }
  doc.forEach((root) => walk(root, ''))
  if (problems.length) {
    throw new Error(`${label}:\n  ${problems.join('\n  ')}`)
  }
}

const MATH_NS = 'http://www.w3.org/1998/Math/MathML'
export function wrapMathMl(fragment) {
  return /^<math[\s/>]/i.test(fragment) ? fragment : `<math xmlns="${MATH_NS}">${fragment}</math>`
}
