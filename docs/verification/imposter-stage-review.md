# Imposter stage refinement — 24 October 2026

Scope: default After Hours Imposter private handoff, public clue table and public accusation reveal. The original six lobby cover references and twenty saved character mappings are preserved.

The private card now has an opaque role-independent ground, fewer redundant instructions/controls and adaptive typography for longer secrets, hints and decoys. No private content exit animation was added. The cover stays mounted during gestures; release, cancellation, blur, visibility loss and pause immediately conceal. Decorative portrait recession does not consult role. The shared hold target keeps a stable footprint.

The clue table names current and next speakers, follows actual direction/start position and tracks clue rounds. Point mode has one main accusation action; secret mode retains the explicit verbal alternative. Compact timer rendering uses the existing timer/audio logic. Roles, words, awards and saved schema are unchanged.

Public verdict pointer/swipe activation has an 850ms skippable anticipation beat. Keyboard/reduced motion bypass it, pause cancels it, and both result branches preserve the existing continuation flow. This updates the previous immediate public-reveal decision only.

## Evidence

Production TypeScript/Vite build and all 29 unit checks passed. The full browser regression passed 43 of 44 scenarios; the remaining older test chose its result branch before the new suspense beat completed. Its synchronization now waits for the actual verdict content before branching. Final focused results are recorded below.

New browser checks exercise long private words, long category hints and long decoys; stable hold-target coordinates; immediate keyboard release concealment; named handoff; no horizontal overflow and pass-action reach at 320×740, 390×844, 820×1024 and 1440×900; current/next clue order in both directions; one-main-action verbal voting and secret voting; suspense skip, automatic completion, keyboard, reduced motion and cancellation on pause. Scoped axe scans report no violations on the held private card, clue screen at all four sizes and final verdict.

Browser captures were inspected in `.impeccable/review/imposter-stage/`. These are local ignored evidence, not shipped assets. Existing tests also verify the six original cover image sources and design rollback.

Physical phone gesture feel, real reflections and broad assistive-technology compatibility have not been validated by these browser checks. No new raster artwork, external request or runtime AI dependency was introduced.

Final focused confirmation: **5 passed** (complete phone Imposter round/replay, long private content, clue/vote flow, public suspense and actual held swipe). All 44 distinct browser scenarios are verified across the full regression and focused confirmation. No production changes followed that confirmation.

A separate Chrome phone-emulation smoke check also passed with dispatched touch input: instruction-area upward swipe reveals while the finger is held, touch-end removes the secret, both named handoffs work, and the clue → accusation → suspense → public verdict journey completes. All six original cover references remain intact. This supplements the mouse/keyboard browser tests; it is not a physical-device check.
