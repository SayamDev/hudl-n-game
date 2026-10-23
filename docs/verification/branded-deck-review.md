# Branded deck review — 24 October 2026

The reported results overlap came from three results cells inheriting a four-column leaderboard layout. Results and the leaderboard now share Scoreboard, with explicit rank/avatar/name/points cells and dark-on-colour gain text.

The Social Club handoff uses original local sealed-deck art, the actual player identity, stable controls and a bounded two-column tablet/desktop composition. Results display the actual winning cast. Settings → Refined deck styling restores the previous presentation without resetting data. Classic and Social Club original are retained.

## Verification

- Production TypeScript/Vite/PWA build passed; 29 unit tests and 7 server tests passed.
- All 33 browser scenarios passed across the first run’s 12 passing checks and the remaining/affected 22 checks (one repeated privacy scenario). The final SVG-only change removes a stray stroke from the n signature; the subsequent production build passed.
- Browser checks exercise 320, 390, 820 and 1440px handoffs/results, dark mode, long names, tied ranks, keyboard holds, immediate concealment, control stability and previous-style results.
- The first visual batch caught excess reveal spacing and a tablet artwork-label collision. Both were corrected in one batch. The second confirmed the layout correction; a final concealment rule prevents transitional artwork from ever crossing private text. No third visual-polish loop was used.
- Scoped axe scans on the captured surfaces found no violations; horizontal overflow checks passed. Hold-button position stayed within 1px when revealed and remained inside portrait phone viewports.
- The design detector returned advisory token/type documentation notes only, with no non-advisory findings. Intentional new tones/type sizes are recorded in DESIGN.md.
- Regression verification reuses passing scenarios rather than repeating the full suite. The initial suite was interrupted after detecting obsolete-copy assertions and a synthetic sensor listener/dwell race. Original concealment copy was retained, and synthetic neutral samples now allow the required dwell even if the first event precedes listener registration. Production focus and gesture safeguards were unchanged.

These are browser checks, not a physical-device sensor or screen-reader audit. Motion feel remains worth trying on the phones used by the group.

## Artwork and dependencies

Motion 14 and Phosphor Icons React 2.1 are installed MIT-licensed dependencies. SecretSleeve and WinnerArtwork are original local SVG/CSS, with no remote artwork request. The supplied [Fakeit listing](https://play.google.com/store/apps/details?id=com.smakapps.imposter&hl=en_GB) was reviewed for inspiration; no proprietary artwork was copied. Automatic approval review blocked exporting the supplied screenshot to 12ui, so design work continued locally without that upload.
