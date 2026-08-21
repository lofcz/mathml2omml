/** `<mrow>` is transparent (no OMML grouping). After `m:nary`, children fill the empty `m:e`. */
export function mrow(element, targetParent, previousSibling, nextSibling, ancestors) {
  if (previousSibling.isNary) {
    const targetSibling = targetParent.children[targetParent.children.length - 1]
    return targetSibling.children[targetSibling.children.length - 1]
  }
  // Ignore as default behavior
  return targetParent
}
