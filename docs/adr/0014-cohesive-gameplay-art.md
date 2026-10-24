# ADR 0014: Cohesive gameplay art and reachable controls

Status: accepted, 24 October 2026.

The user rejected the painted gameplay scenes and very tall readiness/private cards. Keep the pinned lobby images and twenty existing character identities, but replace the six-cell world atlas with original graphic-noir illustration in the same purple/chartreuse/ivory print style. This supersedes ADR 0011's use of the first painted atlas; its stable cell mapping remains unchanged. Prompt and provenance are recorded in docs/art-after-hours.md and docs/art/gameplay-noir-prompt.txt.

Artwork now participates in the game's composition. Heads Up and Charades place a mode-specific scene beside the team; Party puts its crowned-friends scene inside the prompt card. Private sleeves use the same six motifs and receive only public game identity, not player role or secret. Mafia keeps its council-cycle framing; Spy keeps its investigation desk.

A final gameplay.css layer is limited to the refined After Hours presentation. Private Peek uses a stable viewport grid, compact name/portrait header, the held card and the control group. Both role grounds are dark and identical. Holding, release/cancel/blur/pause, guards and native keyboard activation retain their original logic. The secret text has no exit animation.

Readiness has a scrollable middle region for roster, optional tilt practice/status and longer explanations, with a launch action outside it. This protects reach without shrinking text or removing content to force a fit. Short landscape uses columns; enlarged-text mode allows document scrolling. The party prompt uses the remaining viewport space with bounded illustration and actions. No timing, tilt, scoring, role assignment, voting or persisted schema changes.
