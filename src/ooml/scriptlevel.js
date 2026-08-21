/** First child of an OMML argument may carry `m:argPr`/`m:scrLvl` (ECMA-376 §7.1.2.5 / §7.1.2.6). */
export function addScriptlevel(target, ancestors) {
  const scriptlevel = ancestors.find((ancestor) => ancestor.attribs?.scriptlevel)?.attribs
    ?.scriptlevel
  if (['0', '1', '2'].includes(scriptlevel)) {
    target.children.unshift({
      type: 'tag',
      name: 'm:argPr',
      attribs: {},
      children: [
        {
          type: 'tag',
          name: 'm:scrLvl',
          attribs: { 'm:val': scriptlevel },
          children: []
        }
      ]
    })
  }
}
