# Private swipe and named turns — 24 October 2026

The After Hours Imposter private screen now uses the existing illustrated portrait as a large role-independent cover. It names the current player, the next recipient and the pass action. Discussion has an explicit current/next clue giver and a persisted Next clue control. The cast badges remain stable; no newly generated individual portrait collection is included.

Swipe up or activate the native Reveal button, then explicitly hide or pass. Both roles have the same dark surface and subdued text. Blur, visibility loss, pointer cancellation, pause and handoff conceal without an exit animation. Swipe preference can be disabled separately; supported hold-mode tests explicitly select that preference through Settings.

Production TypeScript/Vite build and 29 unit checks passed. The focused swipe scenario verifies actual pointer drag, button/keyboard fallback, role-independent background colours, no early next-player secret, named handoff, Escape concealment and clue advancement. It captures 320, 390, 820 and 1440px states, checks horizontal overflow and confirms the pass button is within the viewport. The revealed Imposter axe scan has no detected violations.

Full browser regression: **40 passed** in 3.1 minutes, including the supported hold preference, all game endings, crew/verbal voting, separate game cards, packs, audio, offline reload, reduced motion and keyboard journeys.

Limits: automated Chrome drag is not physical iOS/Android gesture validation. Matching role colours avoids the former role-specific bright flash, but screen brightness, viewing angle and facial reflections need real-device testing. Screenshots do not certify motion feel or every accessibility scenario. Swipe reveal intentionally remains open after pointer release; the always-visible hide/pass controls and interruption handlers are the concealment boundary for this mode.
