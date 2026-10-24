# ADR 0010: Named, low-light private swipe reveal

Status: accepted, 24 October 2026.

The user requested clearer current/next turn ownership, screen-filling illustration and swipe-up role discovery. Bright Imposter/crew surfaces risk visible reflections, so the new cover and both private role surfaces share a dark palette. Colour consistency reduces a role-dependent flash; browser checks cannot prove that all physical reflections are eliminated.

In refined After Hours Imposter, PrivateReveal replaces the default hold interaction. The artwork cover is independent of role. A deliberate upward drag or native button reveals; release no longer hides in this mode. A direct Hide control and a named Hide & pass action conceal immediately. Window blur, visibility loss, pointer cancellation and pause also conceal. Nothing private is mounted under the cover or retained in an exit animation. Player-keyed local state and a short entry guard prevent the next recipient inheriting the preceding reveal.

Swipe can be disabled independently via Preferences to restore hold-to-peek. Earlier designs and other game modules retain their original Peek behavior. The existing portrait artwork is reused as a shared cover; no new twenty-character portrait cast is claimed. Existing unique alibi emblems and stable player identifiers remain.

Clue order persists in optional session.clueIndex. It starts at startingPlayer and advances through the actual crew list in the saved direction, wrapping without changing roles or scoring. The UI explicitly names the next clue giver.
