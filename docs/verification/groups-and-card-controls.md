# Groups and physical controls review — 24 October 2026

## Verified locally

- Production build, 36 unit tests and seven pack-studio server tests passed.
- The full 49-scenario browser suite passed. After the final public anticipation seal and larger orientation-aware word type, six targeted scenarios passed again: custom groups, cover interruption, orientation/audio, card-face fit, gameplay fit and private keyboard/swipe concealment.
- Chosen-pair browser coverage creates three named groups of two, assigns people through the real setup, plays all three Charades turns, checks the actual actors and winning members, and reloads without a duplicate award.
- Unit coverage checks departed/duplicate memberships, incomplete/empty groups, classic Charades actor+guesser validation, three-team snapshots and score arrays, old-session fallback, exactly-once awards and identical seeded Imposter allocation with/without groups.
- The motion test pulls the cover before the threshold, checks no private content during anticipation, releases early without marking the card seen, reads and swipes down, verifies instant keyboard entry, and pauses during a pending reveal without a late reopen.
- Orientation coverage turns the word on a locked portrait viewport, verifies the rotated bounds, then supplies a native 90° screen angle to prevent double compensation. The answer test observes exactly one rising Correct cue and one falling Skip cue, plus the real score changes.
- Existing controls, audio/countdown, offline, content, voting, crew/replay and original-style fallback checks remained green. Card-face/controls matrices still cover small phone, standard phone, tablet, desktop and short landscape.

Visual review was bounded: one combined review found an empty anticipation interval and undersized turned words; one batch added the neutral seal and area-aware typography; the confirmation showed both corrected. The approved artwork and portraits were not regenerated.

The actual-app smoke checks the unchanged approved WebP bytes and six pinned lobby covers, distinct Charades/Heads Up launch colours, saved chosen groups, all six game faces, actual mounted private words before eight emulated touch release/cancel checks, Imposter down/blur hiding and a named next recipient. It also enables tilt on the actual readiness page and checks word compensation plus Correct/Skip updates. Publication/live smoke are separate steps recorded after the release.

## Limits

Touch and sensor events are browser-emulated. Actual iOS/Android orientation lock, permissions, reach, audio timbre and motion feel remain hardware checks; do not describe these tests as physical-device certification. Ordinary native screen rotation works without a new permission; compensating for a rotation-locked phone uses the existing user-enabled motion permission. No new game was added: the researched options are in docs/party-game-research.md.
