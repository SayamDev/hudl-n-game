# Faster party review — 24 October 2026

## Shipped behavior

Quick group voting is the default for future rounds; existing active secret ballots survive the preference migration. Secret voting is still selectable and can switch explicitly to a group vote. Ties continue discussion without eliminating a player.

Imposter hints use one familiar related word, with category context. Examples: Pizza → Cheese, Penguin → Ice. The authored offline lookup covers all 1,329 built-in entries (1,325 distinct entries after normalization). Unknown custom prompts fall back to their category. Hint usefulness still benefits from real group play feedback; coverage alone does not prove every association has equal difficulty.

No timer is available for discussions and team turns. Classic Charades is discoverable from the home screen, requires four players and keeps prompts private. Actors rotate within each team; timed turns pause during private handoff. Existing Heads Up controls remain available.

The public Imposter verdict uses a swipeable envelope with a keyboard-accessible button alternative. Scrolled game artwork and cards enter once; reduced-motion preferences disable unnecessary movement. Older design choices remain available.

## Evidence

- Production TypeScript/Vite/PWA build passed.
- 29 unit tests and 7 server tests passed.
- All 31 browser scenarios passed across the full run (28 passed) and a focused rerun of the remaining three (3 passed).
- The focused rerun repaired browser focus emulation for synthetic tilt, used reduced motion around a simulated clock, and waited for the existing pack colour transition before measuring contrast. Runtime privacy/focus protections were retained.
- Nine additional production-preview surfaces passed axe scans with no detected violations and no horizontal overflow: 320px setup, 820px dark setup, sealed/open 390px verdict, 390px classic acting, 820px dark classic acting, 320px dark hint, and 390/1440px scrolled artwork.
- Captures inspected for the sealed verdict, acting screen, bold hint and desktop game artwork. Review script: `scripts/review-faster-party.mjs`; captures are local under `.impeccable/review/faster-party/`.
- Familiar hint tests check every built-in entry, single-word form, non-identical secrets, known examples and safe handling of unknown/prototype-like input.
- Browser scenarios cover immediate secret removal, untimed play, ties, migration, swipe reveal, keyboard reveal, actor rotation and timer pause across handoffs.

These are browser and automated accessibility checks, not physical phone sensor testing or a group usability study. Existing curated narration was preserved.

## Skill discovery

The requested Find Skills search identified [Emil Kowalski's animation skills](https://github.com/emilkowalski/skills). Existing installed Animate guidance was sufficient for the implementation; no additional runtime dependency or global skill installation was required.
