# ADR 0013: Readable Imposter stages and public suspense

Status: accepted, 24 October 2026.

The user reported clipped private text, a confusing discussion screen and insufficient suspense. Keep the pinned original lobby covers and illustrated player cast. The refinement applies to the default After Hours Imposter experience; older presentation and hold-control paths remain available.

## Private reading

The reveal window has a stable footprint in closed and held states (300px, 250px on short phones, 320px on wider layouts). Remove the redundant hide button inside a hold-only secret, tighten supporting copy and reduce display type for secret phrases over 24 characters. Use safe centring and internal scrolling as a fallback for unusually large text. The secret uses an opaque, identical dark ground for both roles; only the role/word content differs. The release instruction sits above the hold target, away from the fingertip.

The cover remains mounted/inert during the hold. Private text is still conditionally mounted, with no exit animation, and is synchronously removed on release/cancel/blur/visibility/pause. Portrait recession is decorative, role-independent and disabled under reduced motion. No suspense timer may ever reopen a private card.

## Public clue table

ImposterClues renders current speaker, actual next speaker, named order and clue-round count. It starts at the session's startingPlayer and respects direction. A compact Timer retains the existing timing/audio lifecycle. Untimed rounds say “No timer”. Advancing a clue changes only clueIndex, not the word, timer or roles.

Point mode offers one main action, “Choose a suspect”, and explains that the group agrees out loud before selecting one person. Secret mode offers “Start secret voting” plus the existing explicit verbal alternative. Entering voting resets partial ballots and stops the clock. No scoring or winning rules change.

## Public suspense

This deliberately updates the earlier immediate public-reveal decision in DESIGN.md: pointer/swipe activation stages an 850ms anticipation beat, followed by the existing cover lift. The user explicitly requested suspense. “Reveal now” skips the beat; keyboard/synthetic activation, reduced motion and older non-noir presentations reveal immediately. Unmount/pause cancels the pending reveal. The result and continuation mount together when open, and no award occurs in the animation component.

This public choreography has no connection to private visibility. It must never delay concealment or reveal hidden roles through a role-dependent cover, brightness, artwork or timing.
