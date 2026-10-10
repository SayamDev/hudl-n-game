# Phone tilt and keyboard controls

2026-10-10

Heads Up exposes motion consent on the ready screen, followed by a no-score practice step. No sensor data is uploaded. The browser permission call happens directly after a button press; unsupported, denied and silent sensors leave touch and keyboard controls available.

A screen-normal calculation (`cos(beta) * cos(gamma)`) classifies upright / screen facing floor / screen facing ceiling independently of display rotation. It requires 250ms upright to arm and 150ms at the gesture threshold to commit. Returning upright is mandatory before another gesture. Pause, focus loss, phase changes and manual scoring reset the detector. Only active timed turns can score.

Keyboard: ArrowRight scores Correct, ArrowLeft skips during a Heads Up turn, Escape pauses active games. Dialogs keep their existing Escape-to-close and focus trap. Controls retain native Tab/Enter/Space operation; hold-to-peek uses Space or Enter only while its own button is focused. Printable single-letter shortcuts are deliberately avoided.

Reveal geometry is fixed independently of hidden/revealed content. Only the active face is mounted; secrets are removed immediately on release, blur, pause or visibility loss. No animation delays concealment.

Browser API references: [DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent), [permission request](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static). Hardware support varies; browser automation tests synthetic orientation data and is not a substitute for a real iOS/Android sensor check.
