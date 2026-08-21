import { naryBaseArg } from '../ooml/index.js'

/** `<mrow>` is transparent (no OMML grouping). After `m:nary`, that row fills `m:e` (§7.1.2.32). */
export function mrow(element, targetParent, previousSibling, nextSibling, ancestors) {
  if (previousSibling.isNary) {
    const e = naryBaseArg(targetParent)
    if (e) return e
  }
  return targetParent
}
