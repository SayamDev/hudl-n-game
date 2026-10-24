---
name: Hudl N Game — After Hours
description: An illustrated noir party deck for one shared phone.
colors:
  night-lime: "#d5fa43"
  night-purple: "#ad83ef"
  night-cream: "#f8efd8"
  background: "#f2eee5"
  surface: "#fffaf0"
  ink: "#1b1523"
  muted: "#62556b"
  border: "#c9bed1"
  focus: "#593596"
  dark-background: "#09090f"
  dark-surface: "#17131f"
  dark-muted: "#c5b5d6"
  dark-border: "#62536f"
  deck-background: "#0b0b13"
  deck-border: "#514061"
  deck-muted: "#cfbfdd"
  imposter-background: "#0c0b13"
  imposter-surface: "#1a1624"
  imposter-border: "#665576"
  mafia-background: "#17121d"
  mafia-surface: "#292035"
  mafia-accent: "#efd087"
  spy-background: "#102720"
  spy-surface: "#1d3b31"
  spy-accent: "#c5e8ac"
  charades-background: "#301b21"
  charades-surface: "#4b2b33"
  charades-ink: "#fff0df"
  charades-muted: "#e4c4ce"
  charades-border: "#ad7b8a"
  charades-accent: "#ffad91"
  party-background: "#271c36"
  party-surface: "#3d2b51"
  party-ink: "#fff0c8"
  party-muted: "#e1cfe5"
  party-border: "#a98eb9"
  imposter-reveal: "#f0785d"
  control-lime: "#d4fa77"
  control-ink: "#19211c"
typography:
  display:
    fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif'
    fontSize: "clamp(2.5rem, 7vw, 4.7rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.005em"
  game-title:
    fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif'
    fontSize: "1.8rem"
    fontWeight: 400
    lineHeight: 1
  featured-title:
    fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif'
    fontSize: "clamp(3.8rem, 15vw, 5.8rem)"
    fontWeight: 400
    lineHeight: 0.95
  body:
    fontFamily: '"Space Grotesk", sans-serif'
    fontSize: "1rem"
    lineHeight: 1.55
  deck-body:
    fontFamily: '"Space Grotesk", sans-serif'
    fontSize: "0.82rem"
    lineHeight: 1.45
  secret-word:
    fontFamily: '"Bebas Neue", sans-serif'
    fontSize: "clamp(3.1rem, 10vw, 5rem)"
    fontWeight: 400
  button:
    fontFamily: '"Space Grotesk", sans-serif'
    fontSize: "1.08rem"
    fontWeight: 700
    letterSpacing: "-0.035em"
rounded:
  deck-control: "7px"
  control: "12px"
  deck: "14px"
  card: "16px"
  modal: "20px"
  pill: "99px"
spacing:
  small: "8px"
  grid: "12px"
  phone-gutter: "16px"
  stage: "20px"
  card: "24px"
  desktop-gutter: "32px"
components:
  button-primary:
    backgroundColor: "{colors.control-lime}"
    textColor: "{colors.control-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  deck-play:
    backgroundColor: "{colors.night-lime}"
    textColor: "{colors.dark-surface}"
    rounded: "{rounded.deck-control}"
    padding: "12px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "14px 15px"
  deck-card:
    backgroundColor: "{colors.deck-background}"
    textColor: "{colors.night-cream}"
    rounded: "{rounded.deck}"
  chip-selected:
    backgroundColor: "{colors.control-lime}"
    textColor: "{colors.control-ink}"
    rounded: "{rounded.pill}"
    padding: "7px 11px"
---

# Design System: Hudl N Game — After Hours

## Overview

**Creative North Star: "The After Hours illustrated deck"**

After Hours is a playable illustrated noir deck: midnight card faces, ivory lettering, electric lime actions and violet framing. Condensed display lettering supplies the poster character; the existing Space Grotesk body and controls remain intentionally readable. Names, instructions and controls are real accessible DOM; illustration regions supply atmosphere.

This is a code-led implementation of the direction in `docs/surface-after-hours.md`. Candidate C from 12ui is a critique reference, not an approved pixel comp. Its hosted run ID is not a concept seed. No formal concept-roll seed, quality card or approved-comp pixel gate exists. The previous system is archived at `docs/design-archive/social-club-before-after-hours/DESIGN.md`; Classic has its separate archive. Settings → After Hours art & motion switches back to the previous Social Club look without resetting game data; the original Social Club and Classic design options also remain.

**Key Characteristics:**

- Illustration regions within functional game cards; no screenshot UI.
- Bebas Neue display with Space Grotesk body and controls.
- Twenty stable framed alibis paired with player names.
- Connected deck motion for public state changes; immediate private concealment.
- Phone-first layouts with keyboard and reduced-motion alternatives.

## Colors

The light lobby is warm ivory with dark ink; dark mode uses midnight and cream. Game stages retain their own dark palettes. Frontmatter records the actual source values; it does not flatten them into a single accent.

### Primary

- **Night lime:** home play controls, the active navigation plate, completed round steps and ordinary private reveals.
- **Control lime:** inherited shared primary buttons and selected controls. It intentionally differs from the home deck lime in the current implementation.

### Secondary

- **Night purple:** deck framing and supporting planes. Mafia uses midnight/gold, Spy green, Heads Up coral/wine and Most Likely purple/cream.
- **Imposter reveal coral:** the held private Imposter role. It is mounted only while the hold is active.
- **Alibi colours:** the six existing identity accents remain deterministic; the twenty emblem mappings preserve stored identifiers.

### Neutral

- **Background, surface, ink, muted, border and focus:** theme-aware lobby chrome and controls. High contrast overrides muted text with `--muted: var(--ink)` at both the root and app-shell scope, so supporting text follows the active foreground rather than a fixed muted palette token.
- **Deck background, cream and muted:** fixed illustrated card surfaces and their copy, distinct from the lobby theme.

**The Paired Identity Rule.** Player names accompany alibi art; colour and illustration never carry identity alone.

## Typography

**Display font:** locally hosted Bebas Neue, regular (400), loaded with swap under the SIL Open Font License. **Body and controls:** locally hosted Space Grotesk (300–700), also with swap. Classic retains Fredoka/Nunito.

The display hierarchy is condensed and upright. Shared controls retain their existing Space Grotesk weight and tight tracking. Home introduction increases to (4.4rem) at the deck desktop breakpoint; the featured game increases to (6rem). Other home game titles reduce to (1.55rem) at narrow phones. The wordmark uses (2.2rem), with its secondary portion at (1.45rem); the tilted lowercase n retains Space Grotesk.

Private handoff names use Bebas Neue (3.2rem, line-height 0.95, tracking 0.015em). Private Imposter role text uses (3.6rem); score points use (2rem). Body copy and interactive labels remain sentence case. The actual hierarchy is recorded in frontmatter; local responsive exceptions are not a new global scale.

## Layout

The inherited shell caps at (1120px), with (32px) desktop gutters and at least (16px) phone gutters plus safe-area protection. Setup and play generally cap at (620px); the acting stage can expand to (820px). Phone lobby navigation is fixed with reserved content space; it becomes sticky and capped on wider screens and disappears during sessions.

Home uses two columns with (12px) gaps; the featured game spans both. At (800px), the deck becomes four columns with (16px) gaps; the feature has two internal columns (1.1fr / 1fr). Its art is (280px) high on ordinary phones, (225px) at widths up to (350px), and (430px) on desktop. Other card art uses (125px), increasing to (165px) on desktop. Body copy follows the art in document flow.

The round rail maps actual phases to Roles, Clues, Accuse and Reveal, with a shared moving underline. Crew confirmation is sticky above lobby navigation. Crew rows and score rows keep names, alibis and actions together. Empty crew uses the real empty state rather than invented people.

The private reveal window retains its inherited fixed footprint: height `clamp(260px, 32dvh, 320px)`, minimum (260px), with internally scrolling content and disabled scroll anchoring. The After Hours phone stage reserves a (320px) reveal row, reduced to (260px) when height is at most (740px) and width at most (799px). Wider layouts allow that grid row to flex. Hold and pass controls follow the window without changing position when secret content changes. Inherited responsive rules also use (767/768px), (370px), (450px) and short-landscape height (550px); the new deck's (800px) breakpoint does not replace them.

## Elevation & Depth

Most functional surfaces are flat, separated by a thin border and contrasting fill. Real layered cards provide depth: the private deck has two tilted backs and a face in perspective; the public verdict cover lifts away to expose an identity. The inherited dialog uses `0 24px 90px #0005`; crew confirmation uses `0 10px 24px #0003`; the verdict cover uses `0 14px 30px #0005`.

**The Public Motion Rule.** Motion can stage public state changes, but it must never delay the removal of a private role or word.

Deck art enters once using a spring (650ms, bounce 0.16). Fine-pointer hover art moves over (350ms) and scales to (1.035) with a small rotation. Buttons respond over (140ms), pressing to (0.975); the hold button suppresses that transform. Private card planes fan over (350ms) without containing secret data. The verdict cover moves over (450ms) and fades over (220ms); the identity settles over (380ms). Winner arrival lasts (650ms), with a finite (750ms) burst. Round rail and navigation use springs of (350ms) and (300ms); the shared screen component declares (200ms), with entry offset disabled for the authored After Hours view. The shared easing is `cubic-bezier(0.23, 1, 0.32, 1)` except where spring motion is explicit. Reduced motion disables those decorative transitions/animations and suppresses the victory burst.

## Shapes

Illustrated game cards use the deck radius; shared controls and crew containers keep the control radius. Local deck play buttons are tighter, with (7px) corners; the secondary Charades launch uses (6px). Verdict covers use (10px). Framed alibis are octagonal dark SVG plates containing one of twenty local emblems, a coloured outline and a short baseline. These are illustrations, not glyph icons. Existing seed identifiers map deterministically to emblems modulo twenty and accent colours modulo six; unknown seeds use a deterministic hash.

## Components

### Buttons and fields

Shared buttons retain their inherited lime primary, theme-aware secondary surfaces and minimum (56px) height. Home play buttons are at least (48px); the featured action is at least (56px). Rules links are underlined and at least (44px). Keyboard focus remains visible through the inherited focus treatment. Fields use theme surfaces, thin borders, (14px 15px) padding and a minimum (56px) height. Disabled hold controls remain unavailable during the three-second handoff guard.

### Navigation and selection

The lobby uses a real `aria-current` state with a moving lime plate behind the active label. The plate is decorative and ignores pointer input. Pack chips, pack tiles, time segments and setup sections retain the implemented Social Club control patterns rather than adopting the home illustration crop as a field background.

### Illustrated deck cards

Home cards crop only illustration regions from local `public/art/after-hours/club-illustrations.jpg` via SVG view boxes. Game names, descriptions, player counts, rules and launch buttons remain real text and controls. The featured card receives the larger crop and title. The artwork was generated using 12ui; it is not represented as licensed third-party illustration. Its generation prompt is embedded in the JPEG; the reported provenance scan found zero missing records. Twenty alibi SVG emblems are local game-icons.net assets under CC BY with attribution retained in the app and asset records. Bebas Neue's local OFL license accompanies the font.

### Private sleeve and public verdict

The private sleeve is decorative and receives only ready/seen state, never secret data. Role and word content is conditionally mounted while held, then immediately unmounted on release, cancellation, lost capture, blur, visibility change or pause. Space/Enter holding provides the keyboard equivalent. No exit animation wraps that private content. The stable secret card explicitly uses `transition: none`: foreground and background change in the same frame on reveal and concealment. Explicit revealed and Imposter selectors prevent inherited colour rules from overriding these states; decorative sleeve motion remains separate.

The verdict is public. An upward swipe beyond (45px) or the native Reveal identity button opens the card; the text result mounts immediately from open state. The visual transition does not gate the continuation button. Winner artwork uses up to three actual winning players and a one-shot burst; the illustration is hidden from assistive technology because the result is communicated in text.

## Do's and Don'ts

### Do:

- **Do** pair every alibi with the player name in functional contexts.
- **Do** keep private role and word content conditionally mounted only during a hold.
- **Do** reuse local artwork, preserve its attribution, and keep text and controls in the DOM.
- **Do** provide a direct button for public reveals and respect reduced motion.
- **Do** retain reversible design preferences and existing player identifiers.

### Don't:

- **Don't** animate private concealment or move the hold target on press.
- **Don't** turn a generated critique reference into an approved-comp or pixel-match claim.
- **Don't** use a whole generated UI image as a screen.
- **Don't** infer complete accessibility or device validation from scoped browser captures.

Source scope: `src/after-hours.css`, inherited `src/club.css`, `src/remix.css`, `src/style.css`, and the current AfterHours, NoirArt, Identity, SecretSleeve, Verdict, WinnerArtwork, ui, Preferences, Setup and App components. The refreshed browser evidence lives in `.impeccable/review/after-hours/`; it covers phone/desktop home, crew, setup, sealed/held private play, verdict, results and acting. Treat `checks.json` as the authoritative recorded check list, not a full accessibility audit or physical-device test. This documentation pass did not run browsers or builds.

Not canonized: no unverified finish verdict, approved-comp fidelity, seed or quality-card claim is promoted to a system rule. Inherited visual differences remain recorded as implementation facts; this documentation pass did not repair source or tests.

### Separate acting games

Heads Up and Charades each occupy one lobby card with one primary launch and one rules action. Heads Up describes teammate clues; Charades describes silent acting with at least four players. No extra stretched secondary launch panel or setup mode dropdown. Charades uses a violet surface alongside the coral Heads Up card. Earlier lobby variants also expose both choices separately.

### Illustrated private handoff

After Hours Imposter has a role-independent portrait cover across the private screen. Current player's name and stable alibi emblem stay visible; the next recipient is named above and within the pass action. Swipe up at least 65px or activate Reveal my secret. Revealed text stays until explicitly hidden/passed or interrupted by pause/blur/visibility/cancel. Both roles use the same dark ground and subdued cream/lavender text; no lime/coral role flash. There is no private exit animation. Settings → Swipe to reveal restores the hold interaction without changing the artwork theme. Individual alibi badges remain the existing twenty emblems; the shared portrait is not a new unique portrait for each player.

### Illustrated anthology and cast

The twenty alibis are now distinct etched-print character portraits rather than game-icon emblems in the refined design. Persistent avatar identifiers select fixed atlas cells; roles never select artwork. Use the same portrait across crew, private screen and public result. The original generated sheet and prior design variants remain available; current portraits/scenes come from two new local atlas JPEGs.

Six game scenes: masked Imposter; oxblood/gold Mafia council under a red moon; petrol/seafoam map-and-passport investigation; cobalt/apricot Heads Up team; aubergine/rose silent theatre; ochre/violet social crown. Heads Up and Charades must not share the same scene.

Mafia frames a public night/dawn/vote council cycle. Spy frames its current question and next investigator as a map dossier with a dashed seam. Heads Up foregrounds the visible word and tilt/button input; Charades foregrounds a silent actor and hidden prompt with a stage arch. Party uses an awards scene and ticket-shaped prompt. Shared type/navigation unite the app without forcing all game stages into the same composition.

Council arrival: 650ms; investigation sheet: 450ms; theatre arrival: 600ms; party prompt: 300ms. These are one-shot arrivals and disabled under reduced motion. Imposter swipe-down conceals immediately at 48px and never animates private text away. Both roles retain the identical dark private ground.

## Locked lobby artwork — user correction, 24 October 2026

The supplied 01:48 lobby screenshots are the visual authority. Preserve the exact original Imposter, Mafia, Where Are We, Heads Up, Charades and Most Likely To illustration regions from club-illustrations.jpg. The original repeated Heads Up/Charades crop is intentional under this latest instruction. Do not substitute new world-atlas covers or regenerate these images without explicit user authorisation. Distinct gameplay interactions can remain, but character-art requests apply to players, not these cover images.

Current portraits use five four-character sheets: portraits-1.jpg through portraits-5.jpg, with 627×627 source pixels per character. Match the pinned violet/chartreuse/ivory graphic style. Keep faces framed rather than enlarging a 280px face across the whole viewport. The old 20-cell sheet is archived and not part of the runtime cache.

Private reveal is now swipe up AND HOLD. Release immediately hides the role/word; the button and Space/Enter use the same hold/release pattern. The cover fades back in without moving the button; private text never receives an exit animation. This supersedes the earlier persistent swipe/tap reveal descriptions above. Both roles retain the same subdued dark palette.

## Imposter stage refinement — 24 October 2026

ADR 0013 supersedes the earlier immediate public-verdict description. Private reveal remains immediate and release-protected; its reading surface is opaque #14111d in either role. Stable card heights are 300px, 250px on short phones and 320px on wider screens; phrases longer than 24 characters use smaller display type, with safe internal scrolling for extreme content/text scaling. The inner hide button is removed because this is a continuous hold interaction. The small phone portrait badge clears the recipient's name. The public portrait recedes 12px over 250ms on private reading; it carries no role data, and reduced motion disables it.

The refined clue screen is a speaker table: portrait and name, named next person, visible order/round, compact timer, then one primary accusation action. Desktop puts speaker and next-turn controls side by side. The full-size untimed/scoring blocks are removed from this screen. Point mode says “Choose a suspect”; secret mode keeps a secondary verbal-vote action. Public reveal stages an 850ms, skippable anticipation beat and a 250ms cover tension transition. Keyboard/reduced motion bypass the beat; pause cancels it. Pinned lobby cover regions remain unchanged.

### Charades cover exception — explicit user request, 24 October 2026

Charades now uses its own original hand-gesture illustration from club-illustrations.jpg, at viewBox 620 842 170 150. Heads Up retains the forehead-card crop at 430 842 170 150. This narrowly supersedes the earlier instruction to repeat that crop; every other pinned cover and the original JPEG remain unchanged. No new raster was generated. The shared session engine does not determine lobby artwork: charadesMode selects the cover.

## Cohesive gameplay scenes and viewport layouts — 24 October 2026

ADR 0014 replaces the first painted gameplay atlas with six graphic-noir scenes in the established purple/chartreuse/ivory palette. Source resolution is 1536×1024, six 512px square cells; the new JPEG is smaller than the old one. It does not replace the locked lobby sheet or illustrated player portraits. Heads Up uses an outward-facing forehead phone; Charades a silent mime; Mafia a masked council; Spy a question-map; Party a crowned friend chosen by the others. All game text remains DOM, and no player/role data enters decorative artwork.

The final gameplay.css layer gives refined private Peek a stable viewport grid and a role-independent dark reading ground. The sleeve and copy form a centred card composition; the older absolute content offset is reset. Roster portraits explicitly reset inherited span padding and borders so they fill their intended size. Secret text still unmounts immediately on release/cancel/blur/pause, without an exit animation.

Ready screens pair art and actual team members in one panel. A middle scroll region contains optional tilt practice, long rosters and expandable instructions; the start action remains outside that region. Short landscape uses columns. Party artwork belongs inside the prompt card, with a clear lime main action. Safe-area padding protects bottom actions, while enlarged text uses natural scrolling rather than clipped type. Earlier art/design preferences remain reversible.

## Approved ornamental faces — 24 October 2026

The reviewed six-face collection is approved, with a protected reading area that keeps native text off the illustrated edges. Use the exact local card-faces.webp motifs in CardFace: mask/card, moonlit council, map/compass, phone/rays, theatre/gloves, crown/pointing. Copy is inset 23% horizontally and 17% vertically. Frames have a uniform low-light opacity and dark ground regardless of private role. Imposter role type is dominant; hint type stays smaller in Space Grotesk. Full-card covers use the existing world/portrait art. A stable native input surface replaces the separate visible Imposter reveal button; release still removes private text immediately. Named handoffs say “Pass to [name]”. Original lobby covers and twenty character identities remain pinned. See ADR 0015.
