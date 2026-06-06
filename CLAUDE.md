# ECS Fighting Game — Developer Notes

## Running the game

```bash
npx http-server . -p 8123 -c-1 --silent
# then open http://localhost:8123
```

No build step, no dependencies. Pure vanilla JS loaded via `<script>` tags in `index.html`.

## Key constants (main.js)

| Constant | Value | Purpose |
|----------|-------|---------|
| `fps` | `60` | Tick rate; controls all frame-based timers |
| `attackFrames` | `18` | Duration of punch/kick animations |
| `hitFrames` | `Math.round(fps * 0.6)` = 36 | Duration of hit/block stun |

Changing `fps` automatically scales all durations.

## ECS pattern

Every game object is an **Entity** — a bag of **Components** (named values). **Systems** are pure functions `(entities[]) → entities[]` that read and mutate component values each tick. No classes with methods, no inheritance in the game logic.

## System execution order

Systems run sequentially in the order they appear in `main.js`. This order matters:

```
statsSystem       — reads health, updates DOM
endGameSystem     — checks win/lose
renderingSystem   — draws current frame (reads spriteState from previous tick)
userInputSystem   — translates keydown/keyup into component flags
movementSystem    — applies movement, resets directional flags
enemyAiSystem     — moves enemy, sets isAttacking flag
collisionSystem   — prevents overlap
combatSystem      — resolves damage, block, all spriteState changes
```

Rendering runs **before** combat, so animations are always one frame behind combat events. This is intentional and imperceptible at 60 FPS.

## Animation system

`spriteState` (string) + `spriteTimer` (int, counts down to 0) live on every entity.

- `combatSystem` calls `tickAnimation()` at the start of each entity's processing — it decrements `spriteTimer` and sets `spriteState = "idle"` when it hits 0.
- `combatSystem` is the **only place** that should set `spriteState` or `spriteTimer`. Do not add animation logic to other systems (this was a past bug in `enemyAiSystem`).
- `playAnimation(entity, state)` sets both fields and should only be called when `spriteTimer <= 0` (animation finished) to avoid interrupting mid-animation.

## Input system

Located at the bottom of `movementSystem.js`. Uses two arrays:

- `downEvents` — keys currently held (deduped Set)
- `prevDown` — snapshot of `downEvents` from end of previous frame

`justPressed = downEvents.filter(k => !prevDown.includes(k))` — fires only on the initial keydown, not while held. Used for attack/kick so spamming doesn't freeze the animation.

Movement keys (`←→↑↓`) use `downEvents` (held = continuous movement). Block (`Q`) also uses `downEvents` (hold to block). Attack (`A`) and kick (`S`) use `justPressed`.

## Combat rules

- Player attacks enemy: requires `attackCooldown <= 0` AND player not in hit/block state AND enemy not in hit state.
- Enemy attacks player: requires `attackCooldown <= 0` AND enemy not in hit state.
- Block (`Q` held): enemy damage is `Math.floor(rawDamage / 2)`, minimum 1.
- Both entities enter hit-stun (`spriteState = "hit"` or `"block"`) after being damaged, lasting `hitFrames` frames. Neither can attack during this time.

## Sprite strips

Each animation is a **horizontal PNG strip** — one row of equal-width cells. `SPRITES.cellW = 106`, `SPRITES.cellH = 90`. Frame index is calculated from `spriteTimer` progress.

To add a new animation:
1. Add the sprite strip as `p_<name>.png` and `e_<name>.png` in `images/sprites/`.
2. Add the frame count to `SPRITES.counts` in `renderingSystem.js`.
3. Add `loadSheet` calls for both player and enemy.
4. Add a rendering branch in the state machine (the `if/else if` chain in `renderingSystem`).
5. Add the state name to `isKnockedDown()` in `combatSystem.js` if it should prevent attacking.

## Known quirks

- Enemy AI moves toward the player even while in hit state (it only stops attacking, not moving).
- The enemy's attack animation (`"attack"`) is set by `combatSystem` when it deals damage — not by `enemyAiSystem`. The AI only sets the `isAttacking` component flag.
- `Object.freeze(entities)` in the game loop freezes the array shallowly — entity objects and their component values are still mutable.
