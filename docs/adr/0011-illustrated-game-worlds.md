# ADR 0011: Illustrated cast and game-specific experiences

Status: accepted, 24 October 2026.

The user rejected repeated portraits and similar game presentation, while explicitly asking to continue the illustrated style. Use twenty distinct generated portraits and six separate game scenes, bundled as two local atlas images. Existing avatar identifiers map to fixed cells, so the identity persists through roster reorder, restart and future rounds; role assignment cannot change the selected portrait.

The lobby chooses the correct scene for Heads Up versus classic Charades even though both use the existing charades engine. The same scenes carry into their appropriate game screens. Mafia gains a village council cycle alongside narration and night/day progression. Where Are We gains a map/passport investigation desk with an explicit question giver and next-question action persisted through clueIndex. Heads Up keeps the large visible word board and tilt practice, with a blue team presentation; Charades keeps the hidden actor prompt and silent performance, framed as a theatre stage. Party prompts receive a social-awards scene. Game rules and scoring are not changed by the illustrations.

Motion reflects these contexts: a restrained council arrival, investigation-sheet entrance, theatre scene arrival and prompt entry; reduced motion removes them. Private information never receives an animated exit. Imposter's downward pan over the revealed card conceals as soon as it exceeds 48px, before pointer release, and retains the explicit hide control. Pause renders no private content even before its local state-reset effect runs.

Prior design preferences remain available. The core game modules stay shared where their semantics are shared; this change does not duplicate scoring/session engines to create cosmetic game IDs.
