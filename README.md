<div align="center">

# hudl n game.

### Good company. Bad alibis.

**One phone. Six game choices. Everyone in.**

[Play now](https://sayamdev.github.io/hudl-n-game/) · [How it works](#one-phone-a-whole-party) · [Run locally](#make-it-yours) · [AI setup](docs/pack-studio-setup.md)

Free to play · No accounts · No ads · Phone-first

</div>

![The original Hudl n game illustrated lobby](.github/assets/home.png)

## One phone. A whole party.

Add your crew, choose a game and pass the phone. A short interactive welcome lets new players practise holding to reveal a secret before the real round begins. Names, scores and custom packs stay on the device.

| Your kind of chaos                      | The game                                                                                   | Crew |
| --------------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| A word everyone knows. Almost everyone. | **Imposter** — secret words, clues, accusations and a last-chance guess.                   | 3–20 |
| Trust nobody after dark.                | **Mafia** — narrated nights, secret roles and village votes.                               | 5–20 |
| Same place. One very lost spy.          | **Where Are We?** — location clues, questioning and a hidden outsider.                     | 3–20 |
| Big gestures. Absolutely no words.      | **Heads Up!** — hold the screen up while your team gives clues. | 3–20 |
| You know exactly who it is.             | **Most Likely To / Hot Takes** — point votes or private agreement ratings.                 | 3–20 |

Heads Up and **Charades** have separate game cards. Choose Charades for silent acting with private actor prompts and at least four players.

## A little character. A lot of replay.

<table>
<tr>
<td width="33%"><img src=".github/assets/council.png" alt="Mafia's red moon village council and night progression"></td>
<td width="33%"><img src=".github/assets/investigation.png" alt="Where Are We map desk with the current and next investigator"></td>
<td width="33%"><img src=".github/assets/silent-stage.png" alt="Charades theatre artwork and private actor handoff"></td>
</tr>
<tr><td><b>The council.</b> Narrated nights, dawn reports and village votes.</td><td><b>The investigation.</b> A map desk and named question turns.</td><td><b>The stage.</b> Private prompts and silent acting.</td></tr>
</table>

<details><summary>Meet the twenty illustrated alibis</summary>

![Preview of the twenty sharper violet, lime and ivory character portraits](public/art/after-hours/portraits-1.jpg)

[Characters 5–8](public/art/after-hours/portraits-2.jpg) · [9–12](public/art/after-hours/portraits-3.jpg) · [13–16](public/art/after-hours/portraits-4.jpg) · [17–20](public/art/after-hours/portraits-5.jpg)

Each saved alibi keeps its character across the crew list, private handoff and results. Portraits never depend on secret roles.

</details>

- **Six illustrated card faces:** masks, moonlit councils, maps, phone rays, theatre curtains and crowns share the app’s violet, lime and ivory print style. Charades has its own lavender launch colour.
- **Private reveals:** Imposter’s cover follows your swipe, then lifts with a short anticipation beat; release removes the secret immediately while the cover settles back. Pass buttons name the actual next player. Hold-to-peek remains available in Settings and other games. Switching away hides secrets; returning games resume paused.
- **Less repetition:** local play history helps rotate words, prompts and starting players; secret roles remain random. Small pools can still repeat; this is not a promise of endless unique content.
- **Make your own night:** mix curated words offline, write an original pack, or import one with a link or QR code. Review shared content before playing.
- **Browser comfort:** large touch controls, keyboard paths, reduced motion, light/dark modes, optional sound and installable PWA support. Once cached, the core games work offline.
- **Choose your groups:** name pairs or teams and assign the crew in setup. Heads Up and Charades take turns with those teams. In Imposter and other hidden-role games, the rules and individual awards stay the same; group totals add the members’ points.
- **Choose your look:** the earlier designs remain available in Settings.

## Play with touch, tilt or keyboard

On supported phones, tilt starts selected in **Heads Up!** and **Charades**. Allow motion access when starting if your browser asks, or choose **Turn off tilt** before or during play. Hold upright, tip the screen toward the floor for Correct, or toward the ceiling to Skip. Return upright between gestures. Practice and private actor cards add no points; buttons and keyboard work when sensors are unavailable. The word stays facing one way: tilting never spins the text. Heads Up shows a large lime Correct stamp or violet Skip card, with a bright three-note chime or low double cue. Sound effects and Volume control both.

- **Tab / Shift+Tab:** move between controls; **Enter / Space:** activate a button.
- **Hold Space or Enter on Hold to peek:** reveal your secret; release to hide it immediately.
- **→ / ← in Heads Up!:** Correct / Skip.
- **Esc:** pause a game; dismiss the pause dialog to resume.

Motion support depends on the device and browser. Sensor behaviour is covered by simulated browser events; physical iOS/Android verification is still needed. [Control design and API references](docs/adr/0004-phone-tilt.md).

## Keep the party moving

Imposter defaults to a quick group vote: point together, then tap the accused. Secret pass-and-vote is available in setup. The sealed verdict opens with a swipe or a button, using an original animated card seal to build tension. Skip the suspense with **Reveal now**; keyboard and reduced-motion activation are immediate. Easier hint words give imposters a familiar association—Pizza → Cheese—alongside the category; category-only hints remain available for a harder round.

Choose **No timer** to play at your own pace. **Play Charades** starts classic silent acting with at least four people and an actor plus guesser in every chosen team: privately check the prompt, hide it, then act. Correct/Skip passes the next prompt to another actor; timed games pause for these handoffs. Heads Up remains available as the other play style.

## Voices, tension and fresh words

**Settings → Voice studio** previews two fictional British-English hosts generated locally through VoiceStudio and its Qwen voice-design engine. Public Mafia instructions use bundled recordings, cached for offline play; no runtime AI subscription or model download is needed. Private roles and secret words are never spoken. The exact night report stays on screen.

The optional countdown soundtrack builds from gentle pulses to a faster final ten seconds, changing at one minute and thirty seconds. Pause or leave the game to stop it; **Sound effects**, **Volume** and **Countdown soundtrack** control it.

There are 1,289 family-friendly entries across 15 starter categories, including 150 celebrity names, plus a separately gated adult pack. There is no round quota. Unseen words come first, then older words recycle. **Packs → Add another batch** grows a draft without duplicate words; save more packs to expand your collection. Offline content is finite and free AI services have limits—the app does not promise infinitely many unique words.

## Make it yours

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

For a production preview:

```sh
npm run build
npm run preview
```

Open the URL printed by Vite. Use its Network URL for a phone on the same Wi-Fi. Features such as service workers, device motion and wake lock depend on browser support and may require HTTPS.

### Optional AI, with a review step

The **public GitHub Pages demo uses the offline mixer and manual packs**. It does not expose an API key or run a generation server.

For local AI generation, copy `.env.example` to `.env.local`, add your own Groq key and confirm the account's free-tier configuration. Restart Vite. The server adapter requests a themed draft, validates it and returns it for you to edit before saving. Your crew names and scores are not included in the request.

The adapter has small in-memory usage caps and no paid fallback. Provider availability and free quotas can change. A public AI service needs separate server hosting and durable abuse controls; see the [setup and deployment notes](docs/pack-studio-setup.md). Never put secrets in a `VITE_` variable or commit `.env.local`.

## Possible next games

A team spectrum game, majority-answer guessing and team word association are promising additions. These are research directions, not playable modes yet. [References and implementation tradeoffs](docs/party-game-research.md).

## Under the hood

**React · TypeScript · Vite · Zustand · Motion · Lottie · Playwright · Vitest**

Lazy-loaded game screens share a typed session store. Content and scores persist locally; bounded variety history influences future rounds. The optional Node server keeps provider credentials out of browser bundles. The PWA caches the static app, not AI responses.

```sh
npm test                 # Game logic, content and variety
npm run test:server      # Provider adapter validation and limits
npm run test:e2e         # Production-preview browser journeys
```

Browser tests use installed Google Chrome and start/reuse a preview at port 4173. The repository workflow runs unit/server checks and publishes a static build to GitHub Pages. Browser verification is documented separately; it is not claimed as part of that workflow.

[Architecture](CONTEXT.md) · [Design system](DESIGN.md) · [Asset credits](docs/ASSETS.md) · [Release checks](docs/verification/welcome-release.md)

## Privacy and credits

No accounts, analytics or tracking cookies are built into the app. Browser storage holds the party data; clearing it removes the saved crew, packs and scores. Optional AI sends the theme, batch size and up to 48 recent studio words to the configured provider to discourage repeats. Player identities, roles and active secrets are not sent. Shared links carry the custom pack in the URL fragment.

Created by **[Sayam](https://github.com/SayamDev)**. Source code is [MIT licensed](LICENSE); fonts and icon assets retain their own licences. © 2026 Sayam.

**After Hours** brings an illustrated midnight deck, condensed display type and twenty distinct illustrated characters. Private cards fan into place, public verdicts lift away, and the winning crew lands together. The hold control stays stationary and releasing it removes secret text immediately. Switch back under **Settings → After Hours art & motion** without changing party data.

The illustrated deck, character cast and game-world scenes were generated for this project; earlier alibi emblems retain their CC BY credits. All artwork and fonts are served locally. [Art sources and licences](docs/art-after-hours.md) · [Design and verification notes](docs/verification/after-hours-review.md)

Every new game and replay checks who is in the crew, and game setup includes **Edit crew**. For face-to-face accusations, choose **Out loud — tap the accused**, or use **We voted out loud** during Imposter discussion/private voting. One person selects the accused; no individual phone ballots are required. Secret voting remains available.

Imposter supports swipe up and hold to reveal, then automatically conceals on finger release. The reveal button and Space/Enter use the same hold-and-release behavior. Each saved alibi now has a distinct portrait. Game-specific scenes and interaction framing distinguish the Mafia council, location investigation, team guessing board and silent stage. [Artwork provenance](docs/art-after-hours.md).

The Imposter clue table shows the current speaker, the next person and the crew’s clue order. Group voting has a single **Choose a suspect** action. The public identity reveal adds a short, skippable suspense beat; keyboard and reduced-motion users get an immediate result. Private words still disappear immediately on release.

Gameplay scenes now share After Hours' graphic-noir print style: the Mafia council, Spy dossier, forehead-phone game, silent mime and crowned party guest all belong to the same illustrated deck. Team and prompt cards integrate their artwork, while viewport layouts keep primary actions in reach and let longer help scroll inside the screen. [Artwork and prompt](docs/art-after-hours.md) · [Layout verification](docs/verification/branded-gameplay-review.md).
