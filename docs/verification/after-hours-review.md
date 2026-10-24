# After Hours review — 24 October 2026

## Scope

Code-led illustrated deck redesign, twenty detailed alibi emblems, condensed display type, private sleeve fan, public verdict lift, round progress rail, winner landing and preserved earlier-design rollback. Crew review/verbal vote changes in ADR 0008 are included in this release.

## Verification

- Production TypeScript/Vite build passed. The PWA precache contains 74 entries, approximately 3.7 MiB.
- 29 unit tests and 7 server-adapter checks passed.
- Full browser suite initially passed 36 of 38 scenarios. The two failures caught private Crew colour contrast and high-contrast preference precedence. After repair, both affected scenarios passed in focused reruns; the final private check also covers a long crew word, familiar Imposter hint, fixed hold position, keyboard reveal, Escape, synchronous concealment and axe scanning. The entire 38-case suite was not rerun after these scoped repairs.
- Remaining passing browser scenarios cover all game endings, offline cache/lazy launch, restored pause state, pack editor/import/studio, narrator/audio lifecycle, tilt simulation/fallback, crew editing, verbal voting, reduced motion and prior design fallbacks. New asset checks verify twenty different local SVGs, local display font/illustration, visible credits and the style rollback.
- Eleven captured layouts at 320, 390, 820 and 1440px had no detected axe violations or horizontal overflow. Corrected private Imposter and Crew captures also had no detected violations/overflow. The 320px hold control sits at y586, height60 within a 740px viewport; at 390px it sits at y655, height60 within 844px.
- The initial ordinary-Crew regression exposed a first-frame contrast gap: inherited CSS specificity and a background transition could leave dark text on the sealed background. Explicit state selectors and no private background transition now change text and ground together. Decorative deck motion remains independent of private text.
- Generated-raster provenance scan: one shipping raster, zero missing prompts. Font and emblem licences are bundled and linked from Privacy.

## Design review

Two bounded builder layout passes and an independent Impeccable finish review were used. The review identified an old empty-state emoji, an inconsistent staged result total and incomplete current design documentation; all were corrected. The final follow-up also reviewed the ordinary-Crew contrast repair. DESIGN.md and its sidecar describe the implemented system, including explicit no-seed/no-approved-comp limitations. See the final disposition below.

## Boundaries

Browser screenshots and source checks do not prove physical-device motion quality or preference. Tilt remains simulated-browser evidence; iOS/Android sensor validation is outstanding. This is not a complete accessibility certification, user research study, or an assertion that every player prefers the new design. The older design remains available under Settings → After Hours art & motion.

Final disposition: **ship**, scoped to the reviewer's listed corrections. All four scored items were resolved; no fix-batch visual regressions were observed. This is not a certification of the whole product or physical-device motion feel.
