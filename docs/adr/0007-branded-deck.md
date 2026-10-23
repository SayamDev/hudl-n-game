# Branded private handoff and shared score layout

24 October 2026.

The results page rendered three children per score row while inheriting the leaderboard's four-column grid. A shared Scoreboard now renders rank, avatar, name and points everywhere, with explicit columns and wrapping names. Both current and previous presentations retain this correction.

The default Social Club handoff uses a responsive identity/deck composition. Phone controls remain below the secret and do not move when held. Tablet and desktop split identity and secret into two bounded columns. SecretSleeve is original geometric SVG and receives only ready/seen flags; it never receives role or secret data. Artwork conceals immediately when held and reseals with a short transform/opacity transition after release. Private information still unmounts synchronously on release, blur, pause and handoff. Screen entrances start visible and use a short full-transform transition rather than an opacity-zero spring.

Results show the actual winning cast in an original signed-card composition. Motion and Phosphor Icons are existing MIT-licensed dependencies. No new service, dependency, downloaded art or runtime network call was added. The user-provided Fakeit listing was reviewed as inspiration, without copying its assets. An attempted 12ui screenshot upload was blocked by automatic approval review; implementation continued locally without exporting screenshots.

Preferences.deckStyle defaults on when absent. Settings exposes Refined deck styling for a reversible comparison; scores, player IDs, avatars and game rules are unaffected. Classic and Social Club original retain their own visual identity.
