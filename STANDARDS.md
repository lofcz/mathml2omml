# OMML provenance (MS-PPTX §2.2.8 + ECMA-376)

This converter emits **Office Math** (`m:oMath`), not a PowerPoint package.

## Host split

| Layer | Spec | What we do |
| --- | --- | --- |
| Slide / run wrapper | **[MS-PPTX] §2.2.8** Math Extensions → `a14:m` ([MS-ODRAWXML] 2.3.1.11). Presentation-level flag: `presentationPr/extLst/ext` URI `{4599F94E-CEE6-441E-89CC-EB005ECD8F06}`. | **Not emitted here.** The host (`pptxgenjs-plus` `normalizeOmml`) wraps this fragment in `a14:m`. Bare `m:oMath` is stripped by PowerPoint. |
| Equation content | **ECMA-376 Part 1 §7.1** Shared MLs — Math (`standards/ecma/part-27_shared-mls-reference-material-math.txt` in pptxgenjs-plus) | This library. |

Do **not** emit Word-only run inner content (`w:br` / a fictional `m:br`). `m:r` lists `br` as [ISO/IEC 29500-1] §2.3.3.1 (`w:EG_RunInnerContent`) — Word host markup, not a PPTX `a14:m` child. PowerPoint rejects `m:br` (COM `0x80020009`).

## MathML → OMML

| MathML | OMML | ECMA-376 |
| --- | --- | --- |
| `<math>` | `m:oMath` | §7.1.2.77 |
| `<mi>` `<mn>` `<mo>` `<mtext>` `<ms>` | `m:r` / `m:t` (+ optional `m:rPr`) | §7.1.2.87, §7.1.2.116, §7.1.2.91 |
| `mathvariant` / font style | `m:sty@val` ∈ `p\|b\|i\|bi` | §7.1.2.111, ST_Style §7.1.3.14 |
| `mathvariant` “normal text” | `m:nor` | §7.1.2.74 |
| styled run children | `m:rPr` (nor XOR sty) before optional `w:rPr` | CT_R §7.1.2.87, CT_RPr §7.1.2.91 choice |
| scriptlevel on first arg child | `m:argPr` / `m:scrLvl` | §7.1.2.5, §7.1.2.6 |
| `<mfrac>` | `m:f` / `m:num` / `m:den` / `m:type` | §7.1.2.36, §7.1.2.75, §7.1.2.28, ST_FType §7.1.3.4 (`bar\|skw\|lin\|noBar`) |
| `<msub>` | `m:sSub` or `m:nary` | §7.1.2.101, §7.1.2.70 |
| `<msup>` | `m:sSup` or `m:nary` | §7.1.2.105, §7.1.2.70 |
| `<msubsup>` | `m:sSubSup` or `m:nary` | §7.1.2.103, §7.1.2.70 |
| siblings after n-ary | fill `m:e` as `EG_OMathElements` (`m:r` / …), never mixed text | §7.1.2.32 `CT_OMathArg`, §7.1.2.87, §7.1.2.116 |
| n-ary limits location | `m:limLoc` ∈ `subSup\|undOvr` | ST_LimLoc §7.1.3.8 |
| n-ary grow / hide | `m:grow` `m:subHide` `m:supHide` ∈ `on\|off` | ST_OnOff §7.1.3.9 — **not** `0`/`1` |
| `<msqrt>` | `m:rad` + `m:degHide val="on"` + empty `m:deg` | §7.1.2.88, §7.1.2.27 |
| `<mroot>` | `m:rad` / `m:deg` / `m:e` | §7.1.2.88, §7.1.2.26 |
| `<munder>` `<mover>` | `m:nary` / `m:bar` / `m:acc` / `m:groupChr` / `m:limLow` / `m:limUpp` | §7.1.2.70, §7.1.2.7, §7.1.2.1, §7.1.2.41, §7.1.2.54, §7.1.2.56 |
| accent char | `m:chr` (`CT_Char`, `m:val` only) | §7.1.2.20 |
| bar / group position | `m:pos` sibling, `m:val` ∈ `top\|bot` | §7.1.2.84, ST_TopBot §7.1.3.15 |
| `<munderover>` | `m:nary` or nested `m:limUpp`/`m:limLow` | §7.1.2.70, §7.1.2.56, §7.1.2.54 |
| `<mtable>` | `m:m` / `m:mPr` / `m:mcs` / `m:mr` / `m:e` | §7.1.2.60, §7.1.2.69 |
| ragged rows | pad `m:e` so `m:count` matches every `m:mr` | §7.1.2.64 `count` |
| `<menclose>` longdiv | `m:rad` + hidden deg | §7.1.2.88 |
| `<menclose>` other | `m:borderBox` / hide* / strike* | §7.1.2.11, §7.1.2.44–47, §7.1.2.107–110 |
| `<mmultiscripts>` post | `m:sSub` / `m:sSup` / `m:sSubSup` | §7.1.2.101, §7.1.2.105, §7.1.2.103 |
| `<mmultiscripts>` pre | `m:sPre` | §7.1.2.99 |
| `<mspace linebreak="newline">` | `m:brk` on next `m:rPr`, or `m:box`/`m:boxPr`/`m:brk` | §7.1.2.15, §7.1.2.91, §7.1.2.14 |
| other `<mspace>` | `m:r`/`m:t` preserved space | §7.1.2.116 `xml:space` |
| `<mglyph>` | alt text in `m:t` (no OMML glyph) | — |
| `<semantics>` | unwrap; skip `annotation` / `annotation-xml` | source form must not leak into `m:t` |
| `<mrow>` `<mstyle>` | transparent | — |

## Word vs PowerPoint

`xmlns:w` on `m:oMath` exists because `m:r` / `m:ctrlPr` may carry `w:rPr` (ECMA-376 §7.1.2.23 example). That is optional WordprocessingML *inside* OMML, not a substitute for `a14:m`.
