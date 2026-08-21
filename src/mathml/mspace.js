export function mspace(_element, targetParent, _previousSibling, _nextSibling, _ancestors) {
  // Do not emit <m:br/>. That element is Word-only (ECMA-376 §22.1.2.10);
  // PowerPoint's a14:m math zone refuses to open the package if it is present
  // (bare or inside m:r). Treat linebreak="newline" as a preserved space.
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
