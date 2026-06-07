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
enemyAiSystem     — drives enemy: spacing, attack/kick/block intent flags
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

### Block flag ownership

The `block` flag is set **every frame** by `userInputSystem` as `block = downEvents.includes(81)` (Q held). It is **not** reset inside `combatSystem`. This matters because the combat map processes the player (index 0) before the enemy (index 1): the enemy's branch reads `playerEntity.block` to halve damage, so if the player's branch cleared the flag first, blocking would never register. (That was the original "block does nothing" bug.) The enemy's own `block` flag is likewise managed each frame by `enemyAiSystem`.

A held block also shows a guard stance immediately: `renderingSystem` reads the `block` flag directly (the `guarding` branch), so feedback appears the moment Q is held, not only when a hit is blocked.

## Combat rules

Player and enemy are symmetric — both can punch, kick, and block.

- **Player attacks enemy:** requires `attackCooldown <= 0`, player not in hit/block stun, enemy not in hit/block stun. If the enemy is holding block, damage is halved (min 1) and the enemy plays `block` instead of `hit`.
- **Enemy attacks player:** the AI sets `isAttacking` or `kick`; combat resolves it when `attackCooldown <= 0`, the enemy is not blocking, neither side is stunned, and they are in range. If the player is holding block, damage is halved (min 1).
- **Kicks** deal slightly more damage than punches (raw `2–6` vs `1–4`).
- **Block** (`Q` held / AI guard): incoming damage is `Math.max(1, Math.floor(rawDamage / 2))`.
- Both entities enter hit-stun (`spriteState = "hit"` or `"block"`) after being damaged, lasting `hitFrames` frames. Neither can attack during this time.

## Enemy AI (`enemyAiSystem.js`)

A closure-based decision machine that mimics a human player instead of charging in:

- **Memory across frames** in the closure: `intent`, `decisionTimer`, `attackGap`, `blockHold`.
- **Intent** (`advance` / `hold` / `retreat` / `strafe`) is re-chosen on a randomized timer (~0.3–0.9s), weighted by distance — far ⇒ advance, in range ⇒ footsies.
- **Attacks** are thrown only in range and off-cooldown, mixing punch/kick, with a deliberate `attackGap` pause between swings (no mashing).
- **Reactive block**: when the player is mid-swing and in range, the AI raises guard with ~55% chance for a short `blockHold` window.
- The AI **moves the body directly** (`positionX/Y += speed`), it does *not* use the directional flags (those are driven at speed 5 by `movementSystem` for the player). It only sets the action flags `isAttacking` / `kick` / `block`.
- While stunned (`hit`/`block`) the AI early-returns: the enemy can neither move nor act.
- The enemy does **not** jump (it has no `groundY`/`velocityY` components).

## Sprite strips

Each animation is a **horizontal PNG strip** — one row of equal-width cells. `SPRITES.cellW = 106`, `SPRITES.cellH = 90`. Frame index is calculated from `spriteTimer` progress.

To add a new animation:
1. Add the sprite strip as `p_<name>.png` and `e_<name>.png` in `images/sprites/`.
2. Add the frame count to `SPRITES.counts` in `renderingSystem.js`.
3. Add `loadSheet` calls for both player and enemy.
4. Add a rendering branch in the state machine (the `if/else if` chain in `renderingSystem`).
5. Add the state name to `isKnockedDown()` in `combatSystem.js` if it should prevent attacking.

## UI buttons (main.js + index.html)

- `startGame()` — hides Start, shows the in-game button bar (`#ingameButtons`), resets fighters, starts the loop.
- `inGameRestart()` — resets the fight and keeps playing immediately (always-available Restart, top-right).
- `togglePause()` — `clearInterval` to freeze the loop (state is preserved), shows the "Paused" overlay; click again to resume via `runLoop()`. The overlay is `pointer-events: none` and sits below the button bar so Resume stays clickable.
- `restartGame()` — the game-over modal button; resets and returns to the Start screen.
- `clearPause()` resets the pause toggle on every entry point so you can't get stuck in the "Resume" state.

## Known quirks

- The enemy's attack/kick animation is set by `combatSystem`, not `enemyAiSystem`. The AI only sets the `isAttacking` / `kick` flags; combat plays the matching strip (including on a whiff, mirroring the player's branch).
- `Object.freeze(entities)` in the game loop freezes the array shallowly — entity objects and their component values are still mutable.
