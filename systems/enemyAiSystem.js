// Enemy AI — approximates how a human plays rather than mindlessly charging in.
// It manages spacing (footsies), mixes punches and kicks, blocks reactively, and
// deliberately leaves gaps between actions instead of mashing. Decisions are
// randomized and only refreshed every so often, so the behaviour reads as
// "thinking" instead of robotic. Like before, the AI only sets component flags
// and moves the body — combatSystem still owns all spriteState/damage logic.
const enemyAiSystem = (function aiSystem() {
  const randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  // Convert seconds to frames so timings scale with `fps` (see CLAUDE.md).
  const sec = (s) => Math.max(1, Math.round(fps * s));

  // Persistent AI memory across frames.
  let decisionTimer = 0;
  let intent = "advance"; // advance | hold | retreat | strafe
  let strafeDir = 1;
  let attackGap = 0; // hesitation between swings
  let blockHold = 0; // frames to keep guard up once raised

  const isStunned = (e) => {
    const ss = e.components.spriteState.value;
    return ss === "hit" || ss === "block";
  };

  return (entities) => {
    const e = entities.find((x) => x.components.name.value === "enemy");
    const player = entities.find((x) => x.components.name.value === "player");
    if (!e || !player) return entities;

    // Difficulty tuning (set by main.js). Falls back to "normal" values.
    const cfg = window.aiConfig || {
      aggression: 0.8,
      blockChance: 0.55,
      gapMin: 0.18,
      gapMax: 0.6,
    };

    // Clear per-frame action flags. Movement is applied directly to position
    // below, so the directional flags (which movementSystem drives at speed 5)
    // are intentionally left alone.
    e.components.isAttacking.value = false;
    e.components.kick.value = false;
    e.components.block.value = false;

    const speed = e.components.speed.value;
    const ex = e.components.positionX.value;
    const ey = e.components.positionY.value;
    const px = player.components.positionX.value;
    const py = player.components.positionY.value;

    const dx = px - ex;
    const dyRaw = py - ey;
    const dy = Math.abs(dyRaw);
    const distance = Math.sqrt(dx * dx + dyRaw * dyRaw);
    const dirToPlayer = dx >= 0 ? 1 : -1;

    const minX = window.playfield ? window.playfield.minX : -30;
    const maxX = window.playfield ? window.playfield.maxX : 1300;
    const clampX = (v) => Math.max(minX, Math.min(maxX, v));
    const clampY = (v) => Math.max(195, Math.min(500, v));

    // While stunned (hit/block recovery) the enemy can neither move nor act.
    if (isStunned(e)) return entities;

    // --- High-level decision, refreshed on a timer so it persists a beat ---
    if (--decisionTimer <= 0) {
      decisionTimer = randInt(sec(0.3), sec(0.9));
      const r = Math.random();
      if (distance > 230) {
        intent = "advance"; // too far to do anything but close the gap
      } else if (distance > 130) {
        intent = r < 0.7 ? "advance" : r < 0.88 ? "hold" : "strafe";
      } else {
        // In striking range — play footsies: hold, press, bait, or reposition.
        intent =
          r < 0.5 ? "hold" : r < 0.7 ? "advance" : r < 0.86 ? "retreat" : "strafe";
      }
      strafeDir = Math.random() < 0.5 ? 1 : -1;
    }

    // --- Vertical alignment / strafing on the depth plane ---
    if (intent === "strafe") {
      e.components.positionY.value = clampY(ey + strafeDir * speed);
    } else if (dy > 36) {
      e.components.positionY.value = clampY(ey + Math.sign(dyRaw) * speed);
    }

    // --- Horizontal spacing ---
    const SPACING = 84; // keep about one body away, matching the collision width
    if (intent === "advance") {
      if (Math.abs(dx) > SPACING)
        e.components.positionX.value = clampX(ex + dirToPlayer * speed);
    } else if (intent === "retreat") {
      e.components.positionX.value = clampX(ex - dirToPlayer * speed);
    } else {
      // hold / strafe: stay in the pocket — drift in if too far, back off if
      // uncomfortably close.
      if (Math.abs(dx) > 150)
        e.components.positionX.value = clampX(ex + dirToPlayer * speed);
      else if (Math.abs(dx) < 60)
        e.components.positionX.value = clampX(ex - dirToPlayer * speed);
    }

    // --- Actions: either raise a block OR throw a strike, never both ---
    const inRange = distance < 96; // a touch under combat's 100 so hits land
    const offCooldown = e.components.attackCooldown.value <= 0;
    const playerSs = player.components.spriteState.value;
    const playerAttacking = playerSs === "attack" || playerSs === "kick";

    if (attackGap > 0) attackGap--;

    if (blockHold > 0) {
      // Finish a guard already committed to.
      e.components.block.value = true;
      blockHold--;
    } else if (inRange && playerAttacking && Math.random() < cfg.blockChance) {
      // React to the player's swing by guarding for a short window.
      e.components.block.value = true;
      blockHold = randInt(sec(0.13), sec(0.33));
    } else if (inRange && offCooldown && attackGap <= 0 && intent !== "retreat") {
      // Throw something — mostly attacks, mixing kicks and punches, then pause.
      if (Math.random() < cfg.aggression) {
        if (Math.random() < 0.45) e.components.kick.value = true;
        else e.components.isAttacking.value = true;
        attackGap = randInt(sec(cfg.gapMin), sec(cfg.gapMax));
      }
    }

    return entities;
  };
})();
