# Approved card-face verification — 24 October 2026

The user approved the reviewed artwork and requested wider clearance around native text. This applies the exact approved six-face sheet, with no lobby-cover or player-identity replacement.

## Browser evidence

- All 46 existing/new browser scenarios passed in the complete suite. After the final caption/markup cleanup, the five private-card, clue/verdict and six-game face scenarios passed again.
- The face scenario checks six game/mode views at 320×568, 390×844, 820×1024, 1440×900 and 844×390. Text bounds stay in the protected middle; cards keep at least 22% side clearance, document width/height stay inside the viewport, and normal-height artwork remains substantial. Imposter's role type is more than twice the hint size on the phone fixture.
- The existing gameplay-fit matrix also passes six views at six sizes, including 320×740. Readiness/held controls, axe accessibility, stable holding targets and immediate release concealment are covered.
- A separate browser smoke check verifies the approved asset bytes, all six unchanged lobby cover references, all six game faces, eight emulated touch release/cancel cases, Imposter swipe-down concealment, blur concealment and actual named handoff. The script uses isolated sample crew/roles and blocks service workers to check the served release.
- Visual inspection covered all six phone cards and the desktop collection; the final confirmation includes the larger Heads Up play card after correcting an older grid rule that had overridden its new layout.

## Other checks

Production build passed; all 29 unit tests and all seven pack-studio server tests passed. No scoring, role assignment, timer, tilt, content selection or persistence schema changes. The reviewed PNG is converted to a 533,674-byte quality-95 WebP with the original resolution, not presented as a newly generated high-resolution export.

Narrow detector exceptions retain the existing Space Grotesk type in the preview/card layer and the documented Fredoka/Nunito aliases in unchanged classic styles. No detector rule or whole file is disabled. Original design metadata was not refreshed as unrelated maintenance.

## Limits

Browser touch is emulated. Physical-device reach, screen reflections, display brightness and real motion sensors are not proven by these checks. Text enlargement and exceptional content can scroll inside the reading area rather than overlap the ornament. Live deployment is a separate check, reported after publication.
