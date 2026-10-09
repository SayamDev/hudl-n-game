---
name: Hudl N Game
description: A neo-pop sticker-book party box for one shared phone.
colors:
  purple: "#7c3aed"
  yellow: "#ffd60a"
  pink: "#ff3d8b"
  mint: "#2ee6a6"
  blue: "#38bdf8"
  orange: "#ff8a3d"
  player-lilac: "#b79af5"
  card-pink: "#ffa7cd"
  card-mint: "#83ecc9"
  card-yellow: "#ffe471"
  card-blue: "#a1dcfa"
  ink: "#1b1033"
  background: "#f7f3ff"
  surface: "#fffdf9"
  muted: "#655775"
  focus: "#5120ab"
  chip-selected: "#e3d3ff"
  secret-hidden: "#e9ddff"
  error: "#a91b43"
  error-surface: "#ffe2ea"
  dark-background: "#211735"
  dark-surface: "#312244"
  dark-ink: "#faf5ff"
  dark-muted: "#d0c1e0"
  dark-border: "#bfa7df"
  dark-accent-text: "#c3a0ff"
typography:
  display:
    fontFamily: '"Fredoka Variable", sans-serif'
    fontSize: "clamp(2.7rem, 5.8vw, 4.4rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: '"Fredoka Variable", sans-serif'
    fontSize: "clamp(2.2rem, 5vw, 3.7rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  section:
    fontFamily: '"Fredoka Variable", sans-serif'
    fontSize: "1.65rem"
    fontWeight: 550
    lineHeight: 1.2
  card-title:
    fontFamily: '"Fredoka Variable", sans-serif'
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: '"Nunito Variable", sans-serif'
    fontSize: "1rem"
    lineHeight: 1.55
  button:
    fontFamily: '"Fredoka Variable", sans-serif'
    fontSize: "1.08rem"
    fontWeight: 550
  small:
    fontFamily: '"Nunito Variable", sans-serif'
    fontSize: "0.82rem"
    lineHeight: 1.4
rounded:
  field: "13px"
  control: "16px"
  row: "18px"
  panel: "20px"
  game-card: "26px"
  mobile-game-card: "23px"
  secret-card: "27px"
  pill: "99px"
spacing:
  label-gap: "8px"
  control-gap: "10px"
  compact-gap: "12px"
  form-gap: "20px"
  shelf-gap: "21px"
  stage-gap: "23px"
components:
  button-primary:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-mint:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "14px 15px"
  chip-selected:
    backgroundColor: "{colors.chip-selected}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 11px"
  game-card:
    backgroundColor: "{colors.card-pink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.game-card}"
    padding: "24px"
---

# Design System: Hudl N Game

## Overview

**Creative North Star: "The pocket party box"**

A playful neo-pop sticker book with saturated game colors, deep ink outlines, rounded forms and hard offset shadows. Self-hosted Fredoka gives headings and actions their friendly, chunky voice; Nunito makes instructions and player names easy to scan. Hudl is a simple expressive SVG mascot, and player identity uses the explicitly requested combination of color, emoji and visible names.

The world feels tactile and immediate. Motion marks arrival and celebration; private information appears only while held, without a decorative reveal delay. The identity follows the user-pinned brief; the implemented forms are the authority for exact values.

**Key Characteristics:**

- Saturated purple actions with yellow, pink, mint, blue and orange accents.
- Solid ink outlines and crisp offset shadows.
- Rounded game cards, substantial controls and pill-shaped selections.
- Fredoka display and action text paired with Nunito instructions.
- A simple SVG mascot and emoji player avatars.

Source: `src/style.css`, `src/App.tsx`, `src/components/ui.tsx`, `Dialog.tsx`, `Preferences.tsx`, `Results.tsx`, and `src/store/useGame.ts`. The direction is recorded in `docs/surface.md`; product constraints remain in `PRODUCT.md`.

Verification reference: the finish review supplied to this documentation pass returned **ship for the two reviewed fixes**: 320px art/text separation with nonshrinking play arrows, and removal of the two decorative kickers. It is not universal approval of every surface. Supplied validation: 13 unit tests and 12 production browser scenarios passed; eight captures are in `.impeccable/review/`: `desktop.png`, `mobile.png`, `small-phone.png`, `mobile-dark.png`, `crew.png`, `settings.png`, `peek.png`, `peek-held.png`. See `docs/verification/design-review.md` for the scoped verdict and `docs/verification/lighthouse-summary.json` for the local mobile lab scores (performance 96; accessibility, best practices and SEO 100). This pass inspected code, not a browser, and did not independently repeat those checks or certify WCAG compliance.

## Colors

The palette mixes saturated party accents with softer game-card fills and warm, violet-tinted neutrals. Frontmatter contains the canonical values; preview ramps in the sidecar are synthesized display aids, not implemented theme scales.

### Primary

- **Party Purple:** featured game surface, primary actions, selection controls and light-theme accent text.
- **Sticker Yellow:** mascot body, featured play action, revealed secrets and prompt cards.

### Secondary

- **Pop Pink, Fresh Mint, Sky Blue and Orange:** player identities; pink also colors mascot cheeks, and mint supplies a positive action variant.
- **Player Lilac:** the sixth player color. Player names remain visible alongside decorative emoji avatars.

### Tertiary

- **Card Pink, Card Mint, Card Yellow and Card Blue:** distinct non-featured game surfaces, all with fixed deep ink text and outlines.
- **Selected Lilac and Hidden-Secret Lilac:** selected pack chips and unrevealed secret panels.

### Neutral

- **Deep Ink, Lavender Paper, Warm Paper and Muted Plum:** foreground/outlines, page, controls/panels and supporting text respectively.
- **Dark Background, Dark Surface, Dark Ink, Dark Muted and Dark Border:** theme overrides for the shared CSS variables. Dark accent text replaces purple on selected heading/brand elements. Game cards, yellow prompts and secret panels retain their fixed bright fills and deep ink text.
- **Error and Error Surface:** readable error messages on a pale pink field.

**The Paired Identity Rule.** Keep player names alongside color and emoji; color alone does not identify a player.

High contrast changes the muted text variable to the foreground color in both light and dark themes. The dark override targets the root carrying both `data-theme="dark"` and the `high-contrast` class. Do not infer comprehensive high-contrast coverage from these text-color overrides.

## Typography

**Display Font:** Fredoka Variable, with sans-serif fallback; self-hosted variable weights (300–700).

**Body Font:** Nunito Variable, with sans-serif fallback; self-hosted variable weights (200–1000). Both use `font-display: swap`.

The headline is rounded and compact; instructions use a softer, steady reading rhythm. There is no mathematical type scale: the implementation assigns sizes by role.

- **Display:** home invitation; the frontmatter desktop clamp becomes `clamp(2.15rem, 6vw, 3rem)` on phones and `1.75rem` at the smallest breakpoint.
- **Headline:** general h1 baseline; staged screens override to `2.65rem`, then `2.35rem` on phones.
- **Section:** h2 baseline; shelf headings use `1.55rem` desktop / `1.35rem` phone.
- **Card title:** standard cards use the recorded role, then `1.9rem` on phones. The featured title is `3.7rem` desktop, `2.85rem` phone, and finally `2.15rem` at 370px and below.
- **Body:** paragraph line height is `1.55`; compact card descriptions and secondary copy use smaller contextual sizes. Ordinary field text uses weight 650 and labels 800.
- **Button:** Fredoka actions use weight 550; mobile primary controls use `1rem`.
- **Timer:** tabular numerals, weight 550, `5rem` desktop / `4.5rem` phone / `3rem` short landscape.

The larger-text setting changes the root font size to `19px`, allowing rem-based text to scale. Keep long player names and secret content wrap-capable.

## Layout

The outer shell is centered at a maximum width of `1120px` with `40px` horizontal padding. At 767px and below it uses `22px`; at 370px and below it uses `16px`. The body minimum width is `320px`.

The home shelf uses two columns with a full-width featured card, becoming one column on phones. Its gap changes from `21px` to `18px`. Game stages are centered columns capped at `560px`, with a `23px` gap (`21px` on phones). Forms commonly use `20px`; paired controls use two equal columns and `14px` gaps. Controls inside split layouts have `min-width: 0`.

At 370px and below, the introduction gives Hudl a separate `90px` column; the crew strip stacks. Featured artwork scales down within its own region and the final title override keeps the word clear of the art. Play actions and their `21px` SVG arrows do not shrink. Preserve those corrections when changing copy.

Short landscape viewports (maximum height `550px`) widen stages to `740px` and reduce timer, header and secret-card heights. At a minimum width of `1100px`, the home introduction gains vertical space. These are observed breakpoints, not a framework-wide responsive scale.

## Elevation & Depth

Hard shadows are structural within this user-selected neo-pop world. They make controls and cards look like thick pieces sitting on a flat page; they are not diffuse ambient lighting.

- **Small sticker / play action:** `2px 3px 0` in deep ink.
- **Button:** `3px 4px 0` in the theme border color; primary actions keep deep ink.
- **Game, secret and prompt cards:** `5px 6px 0` in deep ink.
- **Pressed action:** translation `(2px, 3px)` with a `1px 1px 0` shadow.
- **Modal:** `7px 8px 0` in deep ink over a translucent ink backdrop.
- **Update notice:** shared `--shadow`, `4px 5px 0` in deep ink.

**The Physical Press Rule.** A held action moves toward its hard shadow; preserve visible focus independently of the press effect.

Layer order is content (0), local decorative card content (1), update notice (5), modal (10), nested quit confirmation (11), and skip link (20).

## Shapes

Chunky outlines are usually `2px`, increasing to `2.5px` on primary-sized controls and `3px` on game/secret/prompt cards. The implemented card corners are `26px` desktop and `23px` mobile, not the provisional 24px in the surface brief. Controls use `16px`; fields `13px`; row containers `18px`; supporting panels `20px`; secret cards `27px`. Modals use `25px`. These are contextual shapes, not one universal radius.

Chips and switches are pills. Player avatars are rounded squares (`43px` sides, `14px` corners); the private handoff avatar grows to `87px` with `25px` corners. Decorative card art and the brand mark use small rotations. Keep the simple SVG mascot and emoji avatars as intentional product materials.

## Components

### Buttons

Substantial and tactile. Standard buttons have a minimum height of `56px`, a solid outline, rounded corners and the button shadow. Primary is purple with warm-paper text; secondary follows the themed surface and foreground; mint uses fixed deep ink text. The text-button variant removes border, fill and shadow and underlines its label.

Hover slightly darkens standard buttons (`brightness(0.97)`); press compresses the shadow. Transform/shadow transitions last `0.12s`. Disabled controls use opacity `0.48` and a not-allowed cursor. Focus-visible uses a `3px` theme-focus outline offset by `5px`.

### Inputs / Fields

Solid theme surface, foreground and `2px` border; minimum height `56px`, field corners and `14px 15px` padding. Labels sit above with an `8px` gap. Placeholder text uses the muted color at full opacity. Native selects follow the same field treatment; ranges use purple accent color. Error messages have explicit text, a pale pink background and rounded corners.

### Chips and toggles

Pack selections retain native checkboxes inside wrapping pill labels, with `42px` minimum height, `2px` outlines and selected lilac fill. They communicate selection through the checked input as well as background.

Toggles retain a real checkbox with a `52px × 32px` visual track. The knob moves `20px` in `0.15s`; the checked track becomes purple. Keyboard focus outlines the visible track with a `4px` offset. Explanatory text remains adjacent to the label.

### Cards / Containers

Game cards use the fixed game palette, hard card shadow, `3px` deep ink outline and clipped artwork. Card actions distinguish Play from an underlined Rules control. Neutral support panels follow the theme; crew and score rows use rounded outlined surfaces with visible names.

Under `prefers-reduced-motion: no-preference`, cards lift `3px` on hover over `0.18s`. Hudl enters over `0.7s` with `cubic-bezier(0.2, 0.75, 0.34, 0.94)`, moving from a small tilted pose to rest. Stage entry uses opacity and a `12px` vertical offset with a spring (stiffness 360, damping 30); `useReducedMotion` removes the initial offset. CSS disables animation/transitions for reduced motion. Results skip their confetti and non-looping Lottie celebration when reduced motion is requested, leaving the SVG fallback.

### Navigation and dialogs

A compact brand-home button and labeled settings/theme icon buttons form the header. Stage pages offer a text-and-arrow back control with a `48px` minimum height. At the smallest breakpoint the header theme shortcut is hidden; the setting remains available in Preferences. Navigation actions have actual buttons and accessible names; decorative player avatars are hidden from assistive technology.

Dialogs use labeled `dialog`/`alertdialog` roles, focus entry, topmost-dialog Tab trapping, Escape dismissal and focus restoration. The source includes a skip link and focuses the stage heading after page/phase changes. These are implementation conventions, not a substitute for a complete accessibility audit.

### Hold to Peek

A private handoff combines the large player avatar, hidden lilac secret panel and full-width hold control. The panel changes to yellow while held; the action changes from “Hold to peek” to “Release to hide.” A three-second guard disables initial reveal; Hide & pass remains disabled until the secret has been seen and is hidden again.

**The Immediate Privacy Rule.** Hide private content on release, cancellation, lost pointer capture, blur, visibility loss and handoff. Do not animate the secret's disappearance or auto-narrate it. Space and Enter provide hold/release keyboard access; secret content uses `aria-live="off"`.

## Do's and Don'ts

### Do:

- **Do** preserve the user-pinned neo-pop palette, simple SVG mascot, emoji avatars and hard offset shadows.
- **Do** use actual implemented radii and responsive overrides rather than the provisional card measurement.
- **Do** keep names, labels and checked states alongside color cues.
- **Do** preserve 320px text/art separation and nonshrinking play arrows.
- **Do** keep keyboard focus visible and private reveal state transient.
- **Do** honor reduced motion and retain written narration instructions.

### Don't:

- **Don't** reintroduce the removed decorative home kickers or treat their unused CSS as a design primitive.
- **Don't** delay hiding a secret to finish an animation.
- **Don't** replace the supplied world with generic gradients, soft ambient card shadows or a different display font.
- **Don't** promote decorative Unicode spark glyphs or tiny art lettering into a reusable control-icon or typography system.
- **Don't** claim universal accessibility, theme or viewport approval from the scoped finish review.
