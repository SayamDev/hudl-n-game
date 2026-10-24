# Engineering notes

The active round, crew, settings, and custom packs persist in localStorage. Hold-to-peek visibility and investigator findings are transient UI state. Every restored round starts paused. A refreshed narrator never automatically speaks a secret. Pause and visibility loss stop interaction; private reveals close on release, pointer cancellation, blur, and handoff.

Roles and winning rules are pure functions in `src/lib/logic.ts`. Changes to scoring must preserve exactly-once awards (`session.awarded`). Vote ties never eliminate a player. A bodyguard substitutes themself for a protected night victim; a Doctor save takes priority.

There is no remote state or analytics. Share URLs put only a validated pack in the fragment. Import must remain a user confirmation and render all imported values as text.

Layer scale: ordinary content 0, decorative local card layer 1, update notice 5, modal 10, nested quit confirmation 11, skip link 20.

Round variety is stored locally in `variety` alongside the session. Eligible unseen content precedes previously displayed values, which recycle oldest first; case-insensitive duplicate words are removed from decks. Heads Up tracks cards on entering acting/advancing, party prompts track entry to prompt, and Imposter/Spy secrets are remembered at deal time. History is bounded to 2,000 items per pool. Discussion starters rotate independently; secret roles remain random to avoid predictable assignments. Old sessions without `promptDeck` retain their original prompt selection on resume. Nothing is sent to an AI service.

The optional pack studio sends a submitted theme, batch size and up to 48 recent studio draft words through the same-origin `/api/pack-studio` endpoint to Groq. Server-only credentials live in ignored `.env.local`. Vite mounts the adapter for local development/preview; deployment needs equivalent same-origin server routing. Offline curated mixes and the manual editor require no AI. Live connector verified on 2026-10-09. See `docs/pack-studio-setup.md` for free-account constraints and process-local quota limits.

Public Mafia scripts use exported VoiceStudio/Qwen recordings. No private role or secret is narrated. Playback cancellation, timer audio stop conditions and word-library limits are documented in docs/adr/0005-party-audio.md.

Narrator selection is limited to the two bundled VoiceStudio hosts. Legacy device-voice selections resolve to the storyteller. No browser TTS fallback is used; original clip speed preserves phrasing.

Future-round vote defaults upgrade once via voteFlowVersion=2; active ballots remain unchanged. Related hint words are in src/content/hints.json; unknown custom words fall back to category. seconds=0 is untimed. Classic Charades is a charadesMode on the existing game id: actor-peek privacy handoff, >=4 players, prompt absent while acting, clock paused between actors. See docs/adr/0006-faster-party.md.

Refined deck visuals are enabled unless preferences.deckStyle is false. This affects default Social Club handoffs/results only. Scoreboard is shared by Results and the lobby scores page, with four explicit columns in every design; this prevents the former results/avatar overlap. SecretSleeve receives only ready/seen flags and never role/word data. Its visual transition must not delay private text removal.

New game selection and replay always route through Players before GameSettings. Results Play again delegates to onPlayers (quit completed session, retain roster/scores). Setup onPlayers is optional for isolated consumers and links back to crew review. Vote's point mode is the explicit verbal/group mode; switching from private ballots resets partial votes and local selection/tie state without modifying future saved options.

After Hours is the default refined deck presentation. It uses local generated illustration regions in NoirArt, twenty credited Game-icons emblems in Identity, Bebas Neue display type and the existing Space Grotesk body. All interactive labels and controls remain native DOM. Disabling preferences.deckStyle restores the previous Social Club presentation; classic and club-original retain their own graphics. CSS selectors must include both data-design=club and data-edition=remix to avoid hiding the older verdict envelope. Public reveal motion is optional; private secret removal remains synchronous and has no exit animation. See docs/adr/0009-after-hours.md and docs/art-after-hours.md.
