# 0020 — A complete game-night loop

The user requested a more established, professional app after finding Spyfall incompleteness. Preserve the approved identity and prioritise reliable rules, understandable setup and continuation.

Spyfall gets a pure per-round score resolver and persisted match state. Per-round points remain separate from all-night totals until final match completion, when explicit awards use the existing exactly-once finish boundary. Existing two-argument finish calls retain their scoring. Saved Spy rounds without match state remain one-round games. Match length is independent of Charades rounds. The 2022 rulebook linked by the publisher governs timeout voting; source/local art and location differences remain disclosed.

Direct rematch is an additional explicit action using the completed session’s settings and existing crew; the existing Play again action continues to open editable crew/setup. New game selection still reviews the crew. This narrows the earlier always-review rule only for a labelled opt-in rematch.

Service-worker updates occupy normal layout after the header, outside active gameplay, with dismissal and retry feedback. Historical appearances remain available behind a disclosure. Shared privacy help now states that Imposter alone conceals on release, while other private cards require an explicit hide/pass.
