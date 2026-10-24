# Illustrated worlds verification — 24 October 2026

Two locally bundled atlas images supply twenty distinct portraits and six separate game scenes. Native DOM retains all labels, state, controls and player data. The existing portrait identifiers are preserved and never selected from roles. A complete visual inspection of both generated sheets confirmed twenty different characters and different Heads Up versus Charades scenarios.

Production TypeScript/Vite build passed. 29 unit checks passed. The full browser run passed 40 of 41 scenarios. Its one failure was an outdated test comparing only inner SVG markup: atlas cells share an image reference and differ in the SVG viewBox. That test now compares the complete selected SVG, and the final focused compatibility/world run passed both scenarios. The full suite was not repeated after these scoped repairs.

The new world check captures the actual loaded Mafia, Spy, Heads Up, Charades and Party screens at 390 and 1440px, checks horizontal overflow and scans each for axe findings. It verifies Spy question-turn advancement, the Mafia council cycle, all twenty distinct crew portrait view boxes and locally available atlas files. Lazy-screen loading is awaited before capture/scanning. These states had no detected axe violations. A final crop correction keeps the full silent actor visible, while Heads Up retains the forehead card in view.

The private swipe scenario passed with an actual upward drag followed by a downward pan, secret removal, native button/keyboard paths, named handoff and interruption concealment. It retains identical role backgrounds and reachable pass controls at 320/390/820/1440px. Remaining passing browser journeys cover game endings, scoring, protected hold mode, restoration, packs, audio, simulated tilt, offline use, reduced motion and design fallbacks.

Authored scene entrances are one-shot and disabled for reduced motion. No private information has an animated exit. The final paint/style correction carries each team game's palette through all phases via data-play-style; it does not change scoring or session rules.

Raster provenance scan: three files, zero missing records. New atlas metadata records clearly labelled brief summaries and original generation identifiers. See art-after-hours.md for sources. Added assets total about 1.9 MiB; the generated PWA precache is about 5.5 MiB across 77 entries. Offline play needs the updated assets cached first.

A final Party-only layout check confirmed the illustration fills its panel without the former automatic margins; its axe scan had no detected violations or horizontal overflow.

Physical-device swipe feel, reflection privacy and sensor behavior remain unverified. Captures and automated scans do not constitute a complete accessibility certification or prove user preference for the artwork.
