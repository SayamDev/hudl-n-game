# Crew and verbal vote review — 24 October 2026

Production build and 29 unit tests passed. Six focused browser scenarios cover:

- Replay → crew editor → add/remove → setup → edit crew → new round, preserving remaining IDs/scores and assigning roles only to current members.
- A saved crew is reviewed when selecting a different game from the lobby.
- Removing a player below the game minimum disables continuation until someone is added.
- Imposter discussion → verbal selection → accused confirmation → sealed public reveal, with no individual ballots and no early role exposure.
- Switching from an open private ballot clears partial ballots and any selected player.
- Existing hint/no-timer/tie/swipe-verdict behavior and legacy active-secret-vote handling.
- A complete Imposter round through results and replay uses the new crew review route.

Phone captures at 390px (crew) and 320px (verbal selection) were inspected. The verbal selection axe scan had no detected violations or horizontal overflow. The design detector returned no findings. These are focused browser checks, not a complete new device/accessibility audit; prior broader game checks remain documented in branded-deck-review.md.
