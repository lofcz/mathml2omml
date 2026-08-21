/** `<mglyph>` has no OMML counterpart; emit `alt` into `m:t` (§7.1.2.116). */
export function mglyph(element, targetParent, previousSibling, nextSibling, ancestors) {
  // No support in omml. Output alt text.
  if (element.attribs?.alt) {
    targetParent.children.push({
      type: 'text',
      data: element.attribs.alt
    })
  }
}
