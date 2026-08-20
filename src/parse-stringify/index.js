// Copied and adjusted from html-parse-stringify (MIT), rebased on current
// master: https://github.com/HenrikJoreteg/html-parse-stringify (3.1.0 line —
// ReDoS-safe tagRE, stray-`<` bracket counting, multi-line attribute values,
// text after comments). XML adaptations: entity decode on parse / re-encode on
// stringify, `attribs`/`data` node fields, no HTML void-element list,
// character data only inside MathML token elements.

export { parse } from './parse'
export { stringifyDoc } from './stringify'
