export function mspace(element, targetParent, previousSibling, nextSibling, ancestors) {
  if (element.attribs?.linebreak === 'newline') {
    targetParent.children.push({
      name: 'm:br',
      type: 'tag',
      attribs: {},
      children: []
    })
    return
  }
  targetParent.children.push({
    name: 'm:r',
    type: 'tag',
    attribs: {},
    children: [
      {
        name: 'm:t',
        type: 'tag',
        attribs: {
          'xml:space': 'preserve'
        },
        children: [
          {
            type: 'text',
            data: ' '
          }
        ]
      }
    ]
  })
}
