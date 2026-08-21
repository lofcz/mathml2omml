/**
 * Output soundness invariant (ECMA-376 §7.1.2.32 / §7.1.2.87 / §7.1.2.116):
 * character data is legal ONLY inside `m:t`. `m:e` and friends are CT_OMathArg
 * (argPr + EG_OMathElements + ctrlPr) — mixed content makes PowerPoint reject
 * the whole package (COM 0x80020009, "PowerPoint could not open the file").
 *
 * The check runs on the serialized string, which is sound for this emitter:
 * attribute values are escaped (`<`/`>` → entities) so they can never look
 * like element content, and no comments/CDATA are emitted.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mml2omml } from '../src/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// <tag ...>TEXT< — TEXT must be empty/whitespace unless tag is m:t
const MIXED_CONTENT = /<([\w:.-]+)(?:\s[^>]*)?>([^<]*)</g

function assertNoMixedContent(omml, label) {
  let match = MIXED_CONTENT.exec(omml)
  while (match) {
    const [, tag, text] = match
    if (tag !== 'm:t' && text.trim().length > 0) {
      throw new Error(
        `${label}: character data "${text.trim().slice(0, 40)}" directly inside <${tag}> — only m:t may carry text (ECMA-376 §7.1.2.116)`
      )
    }
    match = MIXED_CONTENT.exec(omml)
  }
}

test('fixtures produce no mixed content', () => {
  const fixtures = join(__dirname, 'fixtures')
  const collect = (dir) =>
    readdirSync(dir).flatMap((file) => {
      const full = join(dir, file)
      return statSync(full).isDirectory() ? collect(full) : [full]
    })
  for (const fixture of collect(fixtures)) {
    if (extname(fixture) !== '.mml') continue
    assertNoMixedContent(
      mml2omml(readFileSync(fixture, 'utf8')),
      fixture.slice(fixtures.length + 1)
    )
  }
})

test('adversarial corpus produces no mixed content', () => {
  const cases = {
    // termo.pptx slide 4: flat sibling tokens after an n-ary (MathLive shape)
    naryFlatSiblings: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msubsup><mo>&#8747;</mo><msub><mi>V</mi><mn>1</mn></msub><msub><mi>V</mi><mn>2</mn></msub></msubsup><mi>p</mi><mo>&#8290;</mo><mi>d</mi><mo>&#8290;</mo><mi>V</mi></mrow></math>`,
    // mrow-wrapped operand after n-ary (hub2docx shape)
    naryMrowOperand: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msubsup><mo>&#8721;</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mrow><mi>n</mi></mrow></msubsup><mrow><mi>j</mi></mrow><mrow><mi>x</mi></mrow></mrow></math>`,
    // nested n-ary (double integral) with flat trailing operand
    nestedNary: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msubsup><mo>&#8747;</mo><mn>0</mn><mn>1</mn></msubsup><msubsup><mo>&#8747;</mo><mn>0</mn><mn>2</mn></msubsup><mi>f</mi><mi>d</mi><mi>x</mi></mrow></math>`,
    // mglyph directly after an n-ary
    naryThenMglyph: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msub><mo>&#8721;</mo><mi>i</mi></msub><mi>a</mi><mglyph fontfamily="x" index="1" alt="Z"/></mrow></math>`,
    // mspace (plain + linebreak) after an n-ary
    naryThenMspace: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msub><mo>&#8721;</mo><mi>i</mi></msub><mspace width="0.1em"/><mi>x</mi></mrow></math>`,
    // empty token elements
    emptyTokens: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi></mi><mn></mn><mo></mo><mtext></mtext></mrow></math>`,
    // whitespace-only mo between tokens
    whitespaceMo: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>a</mi><mo> </mo><mi>b</mi></mrow></math>`,
    // wrong-arity script containers (fallback paths)
    arityFallback: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msubsup><mo>&#8721;</mo><mi>i</mi></msubsup><mi>x</mi><msup><mi>y</mi></msup></mrow></math>`,
    // styled tokens interleaved with operators
    styledMix: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi mathvariant="normal">d</mi><mo>&#8290;</mo><mi>V</mi><mo>+</mo><mn>2</mn><mo>&#8290;</mo><mi>q</mi></mrow></math>`,
    // ragged table
    raggedTable: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mtable><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd></mtr><mtr><mtd><mi>c</mi></mtd></mtr></mtable></math>`,
    // quotes in ms
    msQuotes: `<math xmlns="http://www.w3.org/1998/Math/MathML"><ms>he said "hi"</ms></math>`,
    // accents over n-ary bases
    accentVariants: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mover accent="true"><mi>x</mi><mo>^</mo></mover><munder accentunder="true"><mi>y</mi><mo>_</mo></munder></math>`,
    // semantics + annotation (must be dropped, not leaked)
    semanticsAnnotation: `<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msubsup><mo>&#8747;</mo><mn>0</mn><mn>1</mn></msubsup><mi>x</mi><annotation encoding="application/x-tex">\\int_0^1 x</annotation></semantics></math>`,
    // text needing escapes next to an n-ary
    escapedText: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msub><mo>&#8721;</mo><mi>i</mi></msub><mtext>a &lt; b &amp; c</mtext></mrow></math>`,
    // deep nesting
    deepNesting: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><msqrt><msubsup><mo>&#8721;</mo><mi>i</mi><mi>n</mi></msubsup><mfrac><mi>a</mi><mi>b</mi></mfrac></msqrt><mn>2</mn></mfrac></math>`
  }
  for (const [label, mml] of Object.entries(cases)) {
    expect(() => assertNoMixedContent(mml2omml(mml), label)).not.toThrow()
  }
})

test('bare fragment (no math wrapper) does not crash', () => {
  expect(() => mml2omml('<mi>x</mi>')).not.toThrow()
  expect(() => mml2omml('<mo>&#8721;</mo><mi>i</mi>')).not.toThrow()
})

// Keep TS/eslint happy about the unused import pattern some setups flag.
void existsSync
