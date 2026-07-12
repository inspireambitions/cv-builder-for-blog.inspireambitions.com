# InspireAmbitions Product Tokens

This contract governs the CV Builder and AI Job Risk Calculator. Each repository implements the same semantic names locally so deployments remain independent.

## Surfaces

- `--ia-ground`: application background
- `--ia-surface`: controls and working surfaces
- `--ia-ink`: primary text
- `--ia-ink-muted`: supporting text
- `--ia-border`: neutral boundaries
- `--ia-accent`: primary actions and score emphasis
- `--ia-focus`: keyboard focus
- `--ia-success`, `--ia-warning`, `--ia-danger`: status only

## Shape and motion

- Controls: 8px radius
- Cards: 12px radius
- Touch targets: at least 44px
- Routine transitions: 180ms ease-out
- Reduced motion: animations and transitions collapse to 0.01ms

## Product rules

- Components consume semantic tokens. Raw values belong only in token definitions, fixed paper/export geometry, email HTML and documented one-pixel rendering exceptions.
- Dark mode follows system preference, permits manual override and persists locally.
- CV paper preview and exports always use the light paper palette.
- Layout uses logical properties and logical utility classes so Arabic and Urdu can mirror safely.
- Body inputs render at 16px or larger on mobile.
