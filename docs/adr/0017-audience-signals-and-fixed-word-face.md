# 0017 — A fixed word face and visible audience signals

The user's 24 October phone screenshots show a word upside down after a tilt, status copy overlapping in landscape, and private-card instructions touching the handoff button. They asked for obvious public Correct/Skip art and stronger suspense for the final Imposter verdict.

This explicitly supersedes ADR 0016's sensor compensation for word rotation. Device orientation now determines **only the answer gesture**. The word stays upright in the browser's native reading direction; sensor events never rotate the word. Native viewport rotation can still reflow the layout. No unsupported screen-orientation lock is promised.

On touch devices with a secure context and motion API, tilt is selected by default for both Heads Up and classic Charades. Browsers with `requestPermission` are asked only from the player's Start/Draw/Enable tap. Denial or unavailable data leaves button/keyboard play usable. A visible switch disables tilt during readiness and acting. Practice and private actor-card phases never award points; upright reset and dwell still prevent duplicate gestures.

Heads Up shows a full-card public signal for 900ms: lime laurel/check with CORRECT, or violet cards/arrow with SKIP. These contain no word or private role. A new answer can replace a pending signal; pause/phase changes clear it. Correct has three ascending sine notes, Skip two low descending triangle pulses. Both respect the existing sound and volume controls.

The public verdict uses the original six-kilobyte transparent card-seal animation at `public/projects/hudl/scene-3/lottie.json`, authored and checked in the existing official Skottie player. The short 1450ms anticipation is skippable. Explicit keyboard activation and reduced motion open immediately. Animation loading is preloaded at the verdict and never gates the outcome; a static seal remains if it cannot load. Pause, focus loss and visibility changes cancel pending suspense.

Private cards remain a separate interaction: direct upward drag over the stable artwork reveals while held. The upward threshold is 40px; reversal is measured from the highest reached point so a downward return consistently hides. Release/cancel/blur/pause remove private DOM immediately. Only the public sleeve can animate back. The old initial 900ms disabled interval is removed, and portrait instructions are constrained within the card instead of overflowing into the named pass action.

Layout derives the private card's remaining height from its flex parent, including the round rail. Vote uses prominent selectable portraits with a scrollable roster when needed; verdict keeps artwork and outcome together. Landscape status text has one wrapping layout item instead of several children assigned to the same grid cell. Large text may scroll for accessibility.

Motion API reference: [MDN DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent). Authoring tool: [Diffusion Studio's official Lottie player](https://github.com/diffusionstudio/lottie). Sensor tests are browser-emulated; actual handset permission behavior, grip and sound feel remain device checks.
