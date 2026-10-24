# ADR 0016: Chosen groups and physical card controls

Status: accepted, 24 October 2026.

The user clarified two requirements: Heads Up words should follow phone orientation, without a new-word transition; people choose their own pairs/groups while Imposter rules stay the same.

## Groups

Optional GameOptions.teams contains names and member IDs. Names are limited to 24 characters; IDs are filtered for departed/duplicate members. Setup requires complete assignments and nonempty groups; classic Charades requires at least an actor and guesser per group. Active sessions snapshot the groups so subsequent setup changes cannot rename an active turn. Existing sessions fall back to their original alternating two-team layout.

Heads Up/Charades take one turn per chosen team, with teamScores now a variable-length array. Winners are the members of the highest-scoring team(s), including ties. Existing individual awards still run exactly once through finish. Other games keep random roles, their existing turn/win rules and individual scoring; the extra group board simply sums the members' existing points. Group membership does not enter assignRoles. Removing crew members prunes future assignments; new crew must be assigned before starting a configured group round.

## Card movement and privacy

useCoverLift controls public artwork only. Imposter's cover follows the upward drag; past 65px it completes a 260ms lift with the existing strong ease-out curve. Pointer reveals have a cancellable 220ms anticipation beat, with a role-independent “Hold steady” seal beneath the cover. Peek uses the same public lift for held cards. Release or downward return, cancellation, blur, visibility loss, pause or unmount cancels pending work and removes private content immediately. The public cover can settle back over 220ms. No secret exit animation is retained. Keyboard and reduced-motion reveal immediately; keyboard reading has no entrance animation. Peek's handoff names the actual next player.

## Orientation and sound

Native browser orientation handles ordinary portrait/landscape changes. When motion permission is enabled, a gravity projection from beta/gamma determines quarter-turn word compensation, minus the rotation the browser has already applied. A deadband prevents jitter; floor/ceiling answer gestures retain the last readable word angle. ResizeObserver supplies the available reading area after each word/viewport change. Only the word turns; controls, scoring and artwork stay stable.

Correct uses the existing rising success tone (523→1046Hz); Skip has a separate neutral falling cue (660→330Hz). Both buttons suppress their generic tap sound because mark already supplies feedback for pointer, keyboard and tilt actions. Mute/zero volume suppress audio; haptics retain their own preference. No sound files, voice changes or external service is introduced.

Device API reference: [MDN DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent). Browser event tests do not establish physical-device feel or every orientation-lock/browser combination; verify those on actual phones before claiming device certification.
