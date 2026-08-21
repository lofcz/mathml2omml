/**
 * `<mtable>` → `m:m` (ECMA-376 §7.1.2.60); rows `m:mr` (§7.1.2.69), cells `m:e` (§7.1.2.32).
 * Ragged rows are padded so every `m:mr` matches `m:mcs`/`m:count` (§7.1.2.64).
 */
export function mtable(element, targetParent, previousSibling, nextSibling, ancestors) {
  const cellsPerRowCount = Math.max(0, ...element.children.map((row) => row.children.length))
  // Pad ragged rows with empty cells so every m:mr matches the m:count
  // declared in m:mcs (placeholders stay hidden via m:plcHide).
  for (const row of element.children) {
    while (row.children?.length < cellsPerRowCount) {
      row.children.push({ name: 'mtd', type: 'tag', attribs: {}, children: [] })
    }
  }
  const targetElement = {
    name: 'm:m',
    type: 'tag',
    attribs: {},
    children: [
      {
        name: 'm:mPr',
        type: 'tag',
        attribs: {},
        children: [
          {
            name: 'm:baseJc',
            type: 'tag',
            attribs: {
              'm:val': 'center'
            },
            children: []
          },
          {
            name: 'm:plcHide',
            type: 'tag',
            attribs: {
              'm:val': 'on'
            },
            children: []
          },
          {
            name: 'm:mcs',
            type: 'tag',
            attribs: {},
            children: [
              {
                name: 'm:mc',
                type: 'tag',
                attribs: {},
                children: [
                  {
                    name: 'm:mcPr',
                    type: 'tag',
                    attribs: {},
                    children: [
                      {
                        name: 'm:count',
                        type: 'tag',
                        attribs: {
                          'm:val': cellsPerRowCount.toString()
                        },
                        children: []
                      },
                      {
                        name: 'm:mcJc',
                        type: 'tag',
                        attribs: {
                          'm:val': 'center'
                        },
                        children: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
  targetParent.children.push(targetElement)
  return targetElement
}

export function mtd(element, targetParent, previousSibling, nextSibling, ancestors) {
  // table cell
  const targetElement = {
    name: 'm:e',
    type: 'tag',
    attribs: {},
    children: []
  }
  targetParent.children.push(targetElement)
  return targetElement
}

export function mtr(element, targetParent, previousSibling, nextSibling, ancestors) {
  // table row
  const targetElement = {
    name: 'm:mr',
    type: 'tag',
    attribs: {},
    children: []
  }
  targetParent.children.push(targetElement)
  return targetElement
}
