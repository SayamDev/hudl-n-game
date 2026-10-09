# Reverting the visual design

In the app, open Settings → Design → Classic. This restores the original home, wordmark, mascot, type, palette and component styling. Social Club switches back to the new design. The choice persists locally; crews, scores, packs and game settings are shared, not reset.

`src/style.css` is the original base; `src/club.css` is scoped to `data-design="club"`. Classic home markup remains in `src/App.tsx`; Social Club lives in `src/components/ClubHome.tsx`. The clearer private Imposter role is a gameplay usability improvement shared by both designs.

The `classic/` directory preserves the previous home source, stylesheet, design notes and public logo assets. Browser favicon and installed-app icons use the current Social Club brand independently of the in-app setting. To restore those branding assets too, copy the archived icon.svg, icon-192.png, icon-512.png and social.png into public and rebuild.

Social Club original now restores the first lime-and-charcoal home and original emoji avatars. Social Club selects the latest masked-identity edition, animated deck and Imposter round builder. The earlier home component is `src/components/ClubHomeOriginal.tsx`; its original stylesheet snapshot is `social-club-v1/club.css`. Classic remains the original sticker-book design. All choices share saved game data.
