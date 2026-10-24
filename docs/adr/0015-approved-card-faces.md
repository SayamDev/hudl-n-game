# ADR 0015: Approved card faces and protected reading areas

Status: accepted, 24 October 2026.

The user reviewed and approved the six ornamental faces, with one correction: text must not touch the illustration. Use that exact approved sheet, converted to a local WebP, with the existing fonts, original lobby covers and stable character portraits.

Each game selects one public motif: masks/cards for Imposter, moonlit council for Mafia, map/compass for Where Are We?, phone/rays for Heads Up, theatre/gloves for Charades, and crown/pointing gloves for Most Likely To. Heads Up and Charades keep distinct artwork despite sharing the charades engine. No role, secret, hint or player identity enters CardFace.

Card copy occupies a protected rectangle inset 23% from each side and 17% from top/bottom. Text wraps within it; exceptional length or text enlargement can scroll inside that region rather than over the ornament. A single dark ground and equal ornament opacity are used for every role. The stylesheet is scoped to After Hours. Earlier presentations retain their existing cards and controls.

Mafia, location and actor covers now fill their held card, replacing the tiny decorative sleeve. Imposter's illustrated cover fills its stable card too. The separate visible “Hold to reveal” button and duplicate next-recipient sentence are removed. The artwork surface retains a native keyboard/pointer hit target; it reveals while an upward swipe or Space/Enter hold remains active, and conceals on release, cancellation, downward return, focus/visibility loss or pause. Private content is conditionally mounted and has no exit animation. The next action reads “Pass to [name]”, or “Start the clues” for the last player, and stays disabled until a card was read and is closed. Handoff guards remain.

Heads Up and Party put the approved face behind their live prompt. Heads Up keeps a substantial word card and reachable Correct/Skip/finish actions, including a two-column layout on short landscape screens. Timing, tilt, scores, role assignment, roster and voting logic are unchanged.

The preview used sample crew/roles; production uses the existing session. Approval supersedes the earlier review-only gate in .scratch/reveal-design. Source and prompt are documented in docs/art-after-hours.md.
