# Controls and private reveal verification

10 October 2026. Production preview at localhost:4173.

- Production TypeScript/Vite build passed.
- 24 unit tests passed, including orientation classification, deliberate tilt dwell and upright reset.
- All 23 Playwright browser tests passed against the production build.
- New browser coverage verifies practice adds no score; simulated portrait/landscape gestures; permission denial and missing sensor data; keyboard scoring and pause safety; invariant reveal button position and scroll; long words and prominent hints; immediate secret removal on release.
- Nine captured phone, landscape, tablet and desktop surfaces had no horizontal overflow and no automated axe violations. This is scoped automated coverage, not a complete accessibility certification.
- Dark tablet and desktop ready screens were additionally captured.
- Independent visual review approved the final compact roster/instruction grouping and separately reachable launch strip.

## Hardware limitation

Device orientation events and permission responses were simulated in Chrome. Actual iPhone/Safari and Android sensor behaviour still require a physical-device check. Tilt is optional; visible touch controls and keyboard controls remain available.

## Manual controls

Tab/Shift+Tab navigates native controls; Enter/Space activates them. Hold Space/Enter on Hold to peek and release to hide. During Heads Up, Right Arrow scores correct and Left Arrow skips; Escape pauses an active game. Enable tilt on the ready screen and practise before starting the clock: hold upright, turn screen toward floor for correct or ceiling for skip, then return upright.
