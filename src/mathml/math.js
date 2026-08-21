/** MathML `<math>` → `m:oMath` (ECMA-376 §7.1.2.77). Host wraps `a14:m` (MS-PPTX §2.2.8). */
export function math(element, targetParent, previousSibling, nextSibling, ancestors) {
  targetParent.name = 'm:oMath'
  targetParent.attribs = {
    'xmlns:m': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
    'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
  }
  targetParent.type = 'tag'
  targetParent.children = []
  return targetParent
}

/** `<semantics>` unwraps; walker skips `annotation` / `annotation-xml`. */
export function semantics(element, targetParent, previousSibling, nextSibling, ancestors) {
  return targetParent
}
