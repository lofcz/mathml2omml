/**
 * Regression tests for schema violations found by the ECMA-376 corpus
 * (real MathLive output). Each case failed before the fix.
 */
import { mml2omml } from '../src/index.js'
import { validateOmml, wrapMathMl } from './ecma-schema-helper.js'

test('msup over n-ary base does not crash and stays schema-valid', () => {
  // \sum^{n} k used to throw in stringify: m:sub had no children array.
  const mml = '<mrow><msup><mo>&#8721;</mo><mi>n</mi></msup><mi>k</mi></mrow>'
  expect(() => mml2omml(wrapMathMl(mml))).not.toThrow()
  validateOmml(mml2omml(wrapMathMl(mml)), 'msup-nary')
})

test('mathvariant normal does not emit nor+sty together', () => {
  // \mathrm{d}x via MathLive → <mi mathvariant="normal">
  const mml = '<mrow><mi mathvariant="normal">d</mi><mi>x</mi></mrow>'
  const omml = mml2omml(wrapMathMl(mml))
  validateOmml(omml, 'mathvariant-normal')
  expect(omml).toContain('<m:nor/>')
  expect(omml).not.toMatch(/<m:nor\/>\s*<m:sty/)
})

test('mathvariant bold puts m:rPr before w:rPr and sty only', () => {
  const mml = '<mi mathvariant="bold">v</mi>'
  const omml = mml2omml(wrapMathMl(mml))
  validateOmml(omml, 'mathvariant-bold')
  expect(omml.indexOf('<m:sty m:val="b"/>')).toBeLessThan(omml.indexOf('<w:b/>'))
})

test('mathvariant italic emits sty=i', () => {
  const mml = '<mtext mathvariant="italic">&#223;</mtext>'
  const omml = mml2omml(wrapMathMl(mml))
  validateOmml(omml, 'mathvariant-italic')
  expect(omml).toContain('<m:sty m:val="i"/>')
})

test('munderover accent guard reads attribs (accent=true blocks n-ary)', () => {
  // accentuated n-ary base must NOT become m:nary (spec: no accents).
  // Regression: the guard read `element.attributes` (undefined), so the
  // accent flag never fired and this produced m:nary.
  const mml = '<munderover accent="true"><mo>&#8721;</mo><mi>i</mi><mi>n</mi></munderover>'
  const omml = mml2omml(wrapMathMl(mml))
  expect(omml).not.toContain('<m:nary>')
  validateOmml(omml, 'munderover-accent')
})

test('munderover non-accent still maps to m:nary', () => {
  const mml =
    '<munderover><mo>&#8721;</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover>'
  const omml = mml2omml(wrapMathMl(mml))
  expect(omml).toContain('<m:nary>')
  validateOmml(omml, 'munderover-noaccent')
})

test('empty token still emits zero-width placeholder inside m:t', () => {
  const mml = '<mi></mi>'
  const omml = mml2omml(wrapMathMl(mml))
  validateOmml(omml, 'empty-mi')
  expect(omml).toContain('&#x200B;')
})
