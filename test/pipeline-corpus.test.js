/**
 * Real-pipeline corpus: MathLive LaTeX → MathML → mml2omml, validated against
 * ECMA-376 §7.1 (see ecma-schema.test.js for the transcribed rules).
 * Corpus = fika's shipped formula/symbol configs + termo.pptx equations.
 */
import { convertLatexToMathMl } from '../../fika/node_modules/mathlive/mathlive-ssr.min.mjs'
import { mml2omml } from '../src/index.js'
import { validateOmml, wrapMathMl } from './ecma-schema-helper.js'

const FORMULAS = [
  String.raw`\int\int\int _ { \Omega } \left( \frac { \partial {P} } { \partial {x} } + \frac { \partial {Q} } { \partial {y} } + \frac { \partial {R} }{ \partial {z} } \right) \mathrm { d } V = \oint _ { \partial \Omega } ( P \cos \alpha + Q \cos \beta + R \cos \gamma ) \mathrm{ d} S`,
  String.raw`f(x) = \frac {a_0} 2 + \sum_{n = 1}^\infty {({a_n}\cos {nx} + {b_n}\sin {nx})}`,
  String.raw`e ^ { x } = 1 + \frac { x } { 1 ! } + \frac { x ^ { 2 } } { 2 ! } + \frac { x ^ { 3 } } { 3 ! } + ... , \quad - \infty < x < \infty`,
  String.raw`\lim_ { n \rightarrow + \infty } \sum _ { i = 1 } ^ { n } f \left[ a + \frac { i } { n } ( b - a ) \right] \frac { b - a } { n } = \int _ { a } ^ { b } f ( x ) dx`,
  String.raw`\sin \alpha \pm \sin \beta = 2 \sin \frac { 1 } { 2 } ( \alpha \pm \beta ) \cos \frac { 1 } { 2 } ( \alpha \mp \beta )`,
  String.raw`( 1 + x ) ^ { n } = 1 + \frac { n x } { 1 ! } + \frac { n ( n - 1 ) x ^ { 2 } } { 2 ! } + ...`,
  String.raw` e^{ix} = \cos {x} + i\sin {x}`,
  String.raw`\frac {dy} {dx} + P(x)y = Q(x) y^n ({n} \not= {0,1})`,
  String.raw`du(x,y) = P(x,y)dx + Q(x,y)dy = 0`,
  String.raw`y = (\int Q(x) e^{\int {P(x)dx}}dx + C)e^{-\int {P(x)dx}}`,
  String.raw`\frac{{f(b) - f(a)}}{{F(b) - F(a)}} = \frac{{f'(\xi )}}{{F'(\xi )}}`,
  String.raw`f(b) - f(a) = f'(\xi )(b - a)`,
  String.raw`(\arcsin x)' = \frac{1}{{\sqrt {1 - x^2} }}`,
  String.raw`\int {tgxdx = - \ln \left| {x} \right| + C}`,
  String.raw`\frac{{{x^2}}}{{{a^2}}} + \frac{{{y^2}}}{{{b^2}}} - \frac{{{z^2}}}{{{c^2}}} = 1`,
  String.raw`\frac {{d^2}y} {dx^2} + P(x) \frac {dy} {dx} + Q(x)y = f(x)`,
  String.raw`\frac{{\partial f}}{{\partial l}} = \frac{{\partial f}}{{\partial x}}\cos \phi + \frac{{\partial f}}{{\partial y}}\sin \phi`,
  // termo.pptx equations
  String.raw`W=p(V_2 - V_1)`,
  String.raw`W=0`,
  String.raw`W = \int_{V_1}^{V_2} p dV`,
  // common real-world shapes not in fika configs
  String.raw`\sum_{k=1}^{n} k = \frac{n(n+1)}{2}`,
  String.raw`\overline{ab}`,
  String.raw`\overrightarrow{ab}`,
  String.raw`\vec{a} + \vec{b}`,
  String.raw`\hat{\theta}`,
  String.raw`\begin{bmatrix}a & b \\ c & d \end{bmatrix}`,
  String.raw`\begin{cases}a & x = 0 \\ b & x > 0\end{cases}`,
  String.raw`\lim_{x \to 0} \frac{\sin x}{x} = 1`,
  String.raw`{}_a^b X`,
  String.raw`\sqrt[3]{x}`,
  String.raw`\underbrace{a+b}_{c}`,
  String.raw`\sum^{n} k`,
  String.raw`\sum_{i} x`,
  String.raw`{}_{a}^{b}X`,
  String.raw`\mathrm{d}x`,
  String.raw`\mathbf{v}`,
  String.raw`\mathbb{R}`,
  String.raw`\mathfrak{g}`
]
test.each(FORMULAS)('corpus: %s', (latex) => {
  const mml = convertLatexToMathMl(latex)
  const omml = mml2omml(wrapMathMl(mml))
  validateOmml(omml, latex)
  expect(/<\/m:r>[^<]/.test(omml)).toBe(false)
})
