# ADR 0012: Pinned lobby covers and held private swipe

Status: accepted, 24 October 2026. Supersedes persistent swipe revelation in ADRs 0010/0011.

The user clarified that the original purple/lime/ivory game covers are fixed visual references and were not authorised for replacement. Restore the original club-illustrations.jpg regions on every lobby card, including the Imposter hero. Do not reinterpret older requests for game differentiation as permission to change those cover images. New character illustration applies to player identities.

The prior twenty-cell atlas supplied approximately 280×280 pixels per character and was enlarged excessively on private screens. Five new 1254×1254 four-character sheets supply 627×627 pixels per character, over twice the source resolution on each axis. They use the pinned cover palette and stronger graphic contours. Stable avatar indices still select the same character family. One duplicate-looking character was corrected before release. The old atlas is archived under docs/design-archive/character-atlas-v1.jpg rather than precached. Private portrait framing is inset to avoid the former extreme face zoom.

The user explicitly chose concealment on finger release. An upward drag reveals while still held; pointerup/pointercancel, keyboard release, blur, visibility loss and pause hide immediately. The hold button and Space/Enter follow the same continuous interaction. The activation target stays mounted so a reveal cannot cancel its own pointer sequence. The hidden cover becomes inert while private content is visible. No private text waits for an exit animation. The returning cover fades while the controls remain stationary. A transient active-input ref prevents queued drag callbacks from reopening after release.

The named next-recipient pass action, short handoff guard, dark role-independent ground and existing hold preference remain. There is no timed reading window or persistent tap-to-reveal mode in this interaction.
