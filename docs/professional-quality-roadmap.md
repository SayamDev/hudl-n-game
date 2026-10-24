# Hudl n Game — professional quality review

Reviewed 24 October 2026. Target: the existing illustrated noir app at https://sayamdev.github.io/hudl-n-game/ . Assessment A (design/player experience) and Assessment B (detector/browser evidence) ran independently; A completed before B's findings were supplied to the parent. This is a refinement of the approved identity, not a replacement design.

## Direction

Make hosting a game night feel effortless: the same crew can keep playing, rules match what the phone does, progress and scoring are clear, and interruptions never cover controls. Preserve the purple/lime/ivory illustrations, Bebas Neue headings, Space Grotesk body, stable character identities and local-only play. Do not add accounts, decorative waiting, fake popularity claims or generic dashboard chrome to look established.

## Implemented in this pass

- Spyfall now supports a chosen 1/3/5/7/10-round match (five by default), one accusation interruption per player per round, named initiators, official outcome-based points, a bonus for a successful early accuser, previous-spy dealer progression, match standings and exactly-once banking into all-night scores. Older saved single rounds retain a one-round fallback. The publisher-linked 2022 edition's final unanimous vote is used; original local locations/art remain an adaptation, not a reproduction of the published deck.
- The update notice moves into reserved page flow below the header, can be dismissed and reports a failed update without blocking play. It cannot cover bottom navigation.
- Results offer a direct rematch with the same crew and settings, retain the existing Play again path for crew/setup changes, and distinguish match scores from all-night totals.
- Lobby play controls have distinct accessible names. Welcome counts the actual collection, Heads Up instructions reflect configurable teams/rounds, and privacy instructions distinguish Imposter hold/release from persistent private cards.
- Historical appearance choices are retained in a disclosure instead of dominating Settings. Empty Scores uses existing game artwork and a clear next action, without invented data.

## Next priorities

| Priority | Improvement | What success looks like |
| --- | --- | --- |
| 1 | One concise setup pattern across games | Show crew, chosen format, rounds/time and content together; keep a direct start; tuck uncommon settings into Advanced. Imposter's existing ticket is a useful starting point. |
| 1 | Real-device play sessions | Exercise tilt calibration, one gesture/one action, orientation, keyboard, screen readers, enlarged text, interruption/resume and offline use on physical iOS and Android phones. Browser emulation is not hardware proof. |
| 1 | Release-wide gameplay coverage | Complete a real match in every mode, confirm scoring and repeat-play flows, and migrate older browser tests that still assume previous rules or labels. |
| 2 | Stronger host guidance | Optional short example turns, concise phase-specific reminders and clearly named responsibilities; teach through the next action rather than long paragraphs. |
| 2 | A coherent game-night history | Keep completed game summaries and explain where points came from; offer an explicit new-night/reset action without confusing lifetime or match totals. Requires a defined retention model. |
| 2 | Consistent component foundations | Consolidate the layered stylesheets gradually, surface by surface. Give private cards their own surface/control tokens, then unify spacing, radii and type sizes. Avoid a global search-and-replace across seven different game worlds. |
| 3 | Finishing details | Game-family discovery filters, install guidance when supported, a concise release history and a support/contact route once an actual destination is supplied. Avoid fabricated contact information or trust claims. |

## Baseline evidence

Assessment A found a distinct authored identity and scored the baseline 26/40 across Nielsen's ten heuristics. Weakest areas: help matching configured behavior, settings clarity, setup decision load and repeat-play friction. This is qualitative prioritisation, not a certified usability score.

The final implementation build, 66 unit tests and seven server tests pass. Eleven final browser regressions cover a complete three-round Spyfall match/rematch, existing crew editing, private Imposter release, voting, loader timing, welcome and cached offline party play. Earlier checks in this pass also covered the Secret Hitler role/policy handoffs, Friends 18+ and complete Charades rounds. This is targeted regression coverage, not a claim that every older end-to-end test has been migrated or that physical devices were exercised.

Assessment B checked Games, Crew, Packs and Scores at 390×844 and 1440×900 in light and dark themes: 16 isolated browser cases, zero automated WCAG A/AA violations and no horizontal overflow in those states. The live update banner/navigation collision was observed separately in a fresh native browser tab. Automated scans do not prove accessibility of every state or complete device operation.

The detector baseline contained 666 findings: 339 type-scale advisories, 244 colour-token advisories, 81 radius advisories and two warnings about the existing Space Grotesk font. Those counts indicate maintenance drift; they do not establish 666 visual defects. A file-scoped exception now records the approved existing body font in after-hours.css, consistent with existing exceptions. No global rule suppression or font replacement was performed.

Run notes: target slug professional-quality; isolated A/B assessments; no new critique-wide ignore list. Native browser lacked mutable script injection, so no detector overlay/live server was started. Browser evidence used fresh Playwright contexts for isolated theme/viewport testing; no user crew/settings were changed. Temporary review contexts/tabs were closed; evidence was retained in temporary files and .impeccable/review for this review. Initial detector output was truncated, so B captured complete output once more; parent did not repeat the scan.

Rule source: [publisher-linked Spyfall rulebook, 2022 edition](https://cdn.shopify.com/s/files/1/0464/6961/1676/files/Spyfall1_Rules_compressed.pdf?v=1721920618).
