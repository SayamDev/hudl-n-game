# Separate game cards — 24 October 2026

The reported stretched Charades action came from adding a full-width control to a two-column action layout. Removed the extra control and its CSS rather than patching its height.

Heads Up and Charades now have separate cards in every lobby variant. Each sets the existing engine mode explicitly, with distinct descriptions, rules and minimum crew; setup no longer asks users to choose between them again. Existing session IDs and saved rounds remain compatible.

Production build and 29 unit checks passed. Five focused browser checks passed, including untimed/timed Charades and privacy/keyboard behavior. The lobby test checks separate cards, rules and action heights at 390, 820 and 1440px in both After Hours and the previous Social Club style, with no horizontal overflow. Captures were inspected; a final correction gives Charades its violet surface and keeps both primary button labels on one line.
