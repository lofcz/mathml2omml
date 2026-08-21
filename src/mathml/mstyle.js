/** `<mstyle>` is transparent; attributes are read by `text_style.js` when building `m:rPr`. */
export function mstyle(element, targetParent, previousSibling, nextSibling, ancestors) {
  // Ignore as default behavior
  return targetParent
}
