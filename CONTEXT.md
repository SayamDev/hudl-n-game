# Engineering notes

The active round, crew, settings, and custom packs persist in localStorage. Hold-to-peek visibility and investigator findings are transient UI state. Every restored round starts paused. A refreshed narrator never automatically speaks a secret. Pause and visibility loss stop interaction; private reveals close on release, pointer cancellation, blur, and handoff.

Roles and winning rules are pure functions in `src/lib/logic.ts`. Changes to scoring must preserve exactly-once awards (`session.awarded`). Vote ties never eliminate a player. A bodyguard substitutes themself for a protected night victim; a Doctor save takes priority.

There is no remote state or analytics. Share URLs put only a validated pack in the fragment. Import must remain a user confirmation and render all imported values as text.

Layer scale: ordinary content 0, decorative local card layer 1, update notice 5, modal 10, nested quit confirmation 11, skip link 20.

Round variety is stored locally in `variety` alongside the session. Eligible unseen content precedes previously displayed values, which recycle oldest first; case-insensitive duplicate words are removed from decks. Heads Up tracks cards on entering acting/advancing, party prompts track entry to prompt, and Imposter/Spy secrets are remembered at deal time. History is bounded to 2,000 items per pool. Discussion starters rotate independently; secret roles remain random to avoid predictable assignments. Old sessions without `promptDeck` retain their original prompt selection on resume. Nothing is sent to an AI service.

The optional pack studio sends a submitted theme, batch size and up to 48 recent studio draft words through the same-origin `/api/pack-studio` endpoint to Groq. Server-only credentials live in ignored `.env.local`. Vite mounts the adapter for local development/preview; deployment needs equivalent same-origin server routing. Offline curated mixes and the manual editor require no AI. Live connector verified on 2026-10-09. See `docs/pack-studio-setup.md` for free-account constraints and process-local quota limits.

Public Mafia scripts use exported VoiceStudio/Qwen recordings. No private role or secret is narrated. Playback cancellation, timer audio stop conditions and word-library limits are documented in docs/adr/0005-party-audio.md.
