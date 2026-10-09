# Social Club visual review

2026-10-09. Independent Impeccable finish reviewer: **ship**, no material fixes required. Scope: valid settled captures at 320, 390 and 1440px, dark mode, preferences, Classic restoration, crew, locked peek and explicit Imposter reveal, with supporting source inspection. No comp-fidelity claim or physical-device certification.

The reviewer found the sharper logo, type and game deck appropriate to the user’s rejection of the babyish original. Phone game screens use the available viewport; the reveal and tap controls have clear hierarchy. Persistent navigation appears at the viewport edge in full-page images; bottom padding and scroll padding keep the content reachable. Classic restoration is visible in Settings.

The detector ran once. Findings were old-system token differences caused by the authorized redesign plus a generic overused-font warning for Space Grotesk. These were reviewed as intentional choices, not mechanical defects; DESIGN.md and its token sidecar are updated for the new default and preserved variant.

Original icon assets, home source, stylesheet and design notes are preserved in docs/design-archive/classic. The live Classic option restores the old interface; role clarity improvements remain shared. All three shipping rasters have embedded origin metadata.

## Functional verification

Production build and all 13 unit tests passed. Browser suite: ten scenarios passed initially; three affected scenarios then passed in a targeted rerun. The fixes were a dark high-contrast CSS specificity correction, the pack test using the new Packs navigation, and a test looking up the button by its held-state label. Verified design choice survives reload in both directions without losing the crew; explicit Imposter identity and chaos decoy are absent from the DOM after releasing the hold. Phone Hold to Peek stays within the viewport. Responsive and light/dark accessibility, offline reload, five game flows and landscape checks pass. Physical iOS/Android hardware remains untested.
