# Verification record

Production build: TypeScript check and Vite/PWA build passed.

Vitest: 13 checks passed for role counts, crew majority, spy assignment, Mafia balancing, voting ties/plurality, win conditions, Doctor/Bodyguard resolution, Unicode pack round trips, malformed/oversized imports, guess normalization, and content completeness.

Playwright in installed Google Chrome: 12 scenarios passed against the production preview:

1. Phone-sized Imposter round with five players, keyboard hold/release privacy, voting, reveal, score and replay.
2. Refresh restores a paused game with the secret concealed.
3. Custom pack create/share/import and malformed link handling.
4. No horizontal overflow at 320, 390, 768 and 1440 pixels; axe reports no violations on home in light and dark themes.
5. Service worker readiness, network disabled, offline reload, start a previously unopened game, refresh recovery.
6. Both Heads Up team turns and tied scoring.
7. All five Most Likely To prompts and results.
8. Mafia role reveals, Mafia/Doctor/Detective actions, protected private finding, saved village, vote and village win.
9. Private Hot Takes ratings followed by group reveal.
10. Default secret pass-and-vote ballots from every player through the public reveal.
11. Full Spy round and successful final location guess.
12. Landscape Heads Up controls, reduced motion, large text and high contrast settings.

An initial handoff race was found during testing. Peek is now keyed by player and resets its guard synchronously, so the next player's countdown cannot inherit an enabled button. The complete suite passed after that fix.

Responsive review evidence is in the local, gitignored `.impeccable/review/` directory. Independent Impeccable review requested a small-phone artwork/icon fix and removal of promotional kickers. Those changes are documented separately by the review verdict.

Lottie: valid JSON and successful rendering in the official diffusionstudio/lottie Skia Skottie player at frames 0, 16, 37 and 74, with active scene confirmed in `skottie-context.json`. Scene is transparent; settles after a short celebration. The source is bundled at `public/projects/hudl/scene-1/lottie.json`.

Lighthouse data is recorded in `lighthouse.json`. Scores are local mobile lab measurements, not field guarantees. Current Lighthouse does not provide the former PWA category; installability/offline behavior are checked separately through the manifest and service-worker test.

Not physically verified: iOS Safari, an actual phone's accelerometer/vibration, OS-specific speech voices, and installation from a public HTTPS deployment. These APIs retain tap/text fallbacks. No public deployment has been made.

Final local Lighthouse: Performance 96, Accessibility 100, Best Practices 100, SEO 100. LCP 2.6s, TBT 0ms, CLS 0 in that run. Summary in `lighthouse-summary.json`.
