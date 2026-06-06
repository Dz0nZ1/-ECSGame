# ECS Fighting Game

A 2D browser fighting game built with **vanilla JavaScript** using the **Entity Component System (ECS)** architectural pattern. Created as a functional programming course project.

---

## Gameplay

<div align="center">

| Player (Ken) | VS | Enemy (Ken — blue) |
|:---:|:---:|:---:|
| <img src="images/sprites/p_idle.png" height="90"/> | ⚔️ | <img src="images/sprites/e_idle.png" height="90"/> |

</div>

Both fighters start with **100 HP**. The goal is to reduce the enemy's health to zero before your own runs out. The game ends when either fighter is knocked out, and a restart button is shown.

---

## Animations

| State | Player | Enemy |
|-------|:------:|:-----:|
| Idle | <img src="images/sprites/p_idle.png" height="72"/> | <img src="images/sprites/e_idle.png" height="72"/> |
| Punch | <img src="images/sprites/p_punch.png" height="72"/> | <img src="images/sprites/e_punch.png" height="72"/> |
| Kick | <img src="images/sprites/p_kick.png" height="72"/> | <img src="images/sprites/e_kick.png" height="72"/> |
| Block | <img src="images/sprites/p_block.png" height="72"/> | <img src="images/sprites/e_block.png" height="72"/> |
| Hit | <img src="images/sprites/p_hit.png" height="72"/> | <img src="images/sprites/e_hit.png" height="72"/> |

---

## Controls

| Key | Action |
|-----|--------|
| `←` `→` | Move left / right |
| `↑` `↓` | Move up / down |
| `Space` | Jump |
| `A` | Punch |
| `S` | Kick |
| `Q` *(hold)* | Block — halves incoming damage |

---

## How to Run

No build step required — open `index.html` in a browser, or serve the folder with any static HTTP server:

```bash
npx http-server . -p 8123 -c-1
```

Then open `http://localhost:8123`.

---

## Architecture

The game uses a pure **Entity Component System** architecture:

```
Entity = ID + bag of Components
Component = named value (e.g. positionX, health, spriteState)
System = function(entities[]) → entities[]
```

The game loop runs at 60 FPS via `setInterval` and pipes entities through all systems in order each tick.

### Systems (in execution order)

| System | Responsibility |
|--------|---------------|
| `statsSystem` | Updates HP bars in the DOM |
| `endGameSystem` | Detects win/lose and shows game-over screen |
| `renderingSystem` | Draws sprites to canvas, resolves animation frames |
| `userInputSystem` | Maps keyboard events to component flags |
| `movementSystem` | Applies velocity, gravity, jump arc, playfield clamp |
| `enemyAiSystem` | Moves enemy toward player, sets `isAttacking` flag |
| `collisionSystem` | Prevents fighters from overlapping |
| `combatSystem` | Resolves damage, block, and all animation state changes |

### Entities

| Entity | Key Components |
|--------|---------------|
| `player` | `positionX/Y`, `health`, `isAttacking`, `kick`, `block`, `spriteState`, `spriteTimer`, `attackCooldown`, `jump` |
| `enemy` | `positionX/Y`, `health`, `isAttacking`, `spriteState`, `spriteTimer`, `attackCooldown`, `speed` |

### Animation States

`spriteState` drives which sprite strip is rendered. `spriteTimer` counts down each frame; when it reaches 0 the entity reverts to `idle`.

| State | Trigger | Duration |
|-------|---------|----------|
| `idle` | Default | — |
| `walk` | Detected from X-position delta | — |
| `attack` | Player presses A / enemy attacks | `attackFrames` (18 f) |
| `kick` | Player presses S | `attackFrames` (18 f) |
| `jump` | Space pressed | Until landing |
| `hit` | Entity takes damage | `hitFrames` (~36 f) |
| `block` | Player holds Q while taking damage | `hitFrames` (~36 f) |

---

## Project Structure

```
-ECSGame/
├── index.html
├── main.js                    # Game loop, settings (fps, attackFrames)
├── components/
│   └── components.js          # Component & Entity base classes
├── entities/
│   ├── entity.js
│   ├── playerEntity.js
│   └── enemyEntity.js
├── systems/
│   ├── combatSystem.js        # Damage, block, all animation state changes
│   ├── enemyAiSystem.js       # Enemy movement and attack intent
│   ├── movementSystem.js      # Physics, input mapping
│   ├── renderingSystem.js     # Canvas drawing, sprite selection
│   ├── collisionSystem.js
│   ├── statsSystem.js
│   └── endGameSystem.js
└── images/
    ├── background.png
    └── sprites/               # Sprite strips (one row per animation state)
        ├── p_idle.png  e_idle.png
        ├── p_walk.png  e_walk.png
        ├── p_punch.png e_punch.png
        ├── p_kick.png  e_kick.png
        ├── p_jump.png  e_jump.png
        ├── p_hit.png   e_hit.png
        └── p_block.png e_block.png
```
