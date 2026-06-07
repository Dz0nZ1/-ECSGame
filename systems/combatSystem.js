//Combat system
const combatSystem = (entities) => {
  const calculateDistance = (entity1, entity2) => {
    return Math.sqrt(
      Math.pow(
        entity1.components.positionX.value - entity2.components.positionX.value,
        2
      ) +
        Math.pow(
          entity1.components.positionY.value -
            entity2.components.positionY.value,
          2
        )
    );
  };

  // Hit animation lasts longer than attack animation so the knockdown is visible.
  const hitFrames = Math.round(fps * 0.6);

  const tickAnimation = (entity) => {
    if (entity.components.spriteTimer.value > 0) {
      entity.components.spriteTimer.value -= 1;
      if (entity.components.spriteTimer.value <= 0) {
        entity.components.spriteState.value = "idle";
      }
    }
  };

  const playAnimation = (entity, state) => {
    entity.components.spriteState.value = state;
    entity.components.spriteTimer.value = attackFrames;
  };

  const isKnockedDown = (entity) => {
    const ss = entity.components.spriteState.value;
    return ss === "hit" || ss === "block";
  };

  const minX = window.playfield ? window.playfield.minX : -30;
  const maxX = window.playfield ? window.playfield.maxX : 1300;

  // Roughly the upper-body point of a fighter, used to anchor hit effects.
  const fxX = (e) => e.components.positionX.value + 75;
  const fxY = (e) => e.components.positionY.value + 55;

  // Shove the victim away from the attacker (softened on a block).
  const knockback = (victim, attacker, amount, blocked) => {
    const dir =
      victim.components.positionX.value >= attacker.components.positionX.value
        ? 1
        : -1;
    const kb = blocked ? amount * 0.35 : amount;
    victim.components.positionX.value = Math.max(
      minX,
      Math.min(maxX, victim.components.positionX.value + dir * kb)
    );
  };

  // Spark + damage number + screen shake + sound, in one place.
  const impact = (victim, dealt, kind) => {
    if (window.spawnHitFx) window.spawnHitFx(fxX(victim), fxY(victim), dealt, kind);
    if (window.SFX) (kind === "block" ? window.SFX.block() : window.SFX.hit());
  };

  const newEntities = entities.map((entity) => {
    if (entity.components.name.value === "player") {
      tickAnimation(entity);

      const enemyEntity = entities.find(
        (e) => e.components.name.value === "enemy"
      );

      if (enemyEntity) {
        const distance = calculateDistance(entity, enemyEntity);
        const isAttacking = entity.components.isAttacking.value;
        const isKicking = entity.components.kick.value;

        if (
          distance < 100 &&
          (isAttacking || isKicking) &&
          entity.components.attackCooldown.value <= 0 &&
          !isKnockedDown(entity) &&
          !isKnockedDown(enemyEntity)
        ) {
          const rawDamage = Math.floor(Math.random() * 5) + 1;
          // The enemy can guard too — a held block halves the incoming hit.
          const enemyBlocking = enemyEntity.components.block.value;
          const dealt = enemyBlocking
            ? Math.max(1, Math.floor(rawDamage / 2))
            : rawDamage;
          enemyEntity.components.health.value -= dealt;
          entity.components.attackCooldown.value = fps / 2;
          enemyEntity.components.spriteState.value = enemyBlocking
            ? "block"
            : "hit";
          enemyEntity.components.spriteTimer.value = hitFrames;

          knockback(enemyEntity, entity, isKicking ? 22 : 16, enemyBlocking);
          impact(
            enemyEntity,
            dealt,
            enemyBlocking ? "block" : isKicking ? "kick" : "hit"
          );
        }

        if (!isKnockedDown(entity) && entity.components.spriteTimer.value <= 0) {
          if (isAttacking) {
            playAnimation(entity, "attack");
            if (window.SFX) window.SFX.swing();
          } else if (isKicking) {
            playAnimation(entity, "kick");
            if (window.SFX) window.SFX.swing();
          }
        }

        entity.components.attackCooldown.value = Math.max(
          0,
          entity.components.attackCooldown.value - 1
        );
      }

      entity.components.isAttacking.value = false;
      entity.components.kick.value = false;
      // NOTE: block is intentionally NOT reset here. The enemy branch (processed
      // after the player in this same map) reads playerEntity.block, so clearing
      // it here would hide the block before the enemy ever sees it. The flag is
      // managed each frame by userInputSystem instead.

      return entity;
    } else if (entity.components.name.value === "enemy") {
      tickAnimation(entity);

      const playerEntity = entities.find(
        (e) => e.components.name.value === "player"
      );

      if (playerEntity) {
        const distance = calculateDistance(entity, playerEntity);

        // The AI decides *when* to swing (isAttacking / kick); combat only
        // resolves the hit. It also can't strike while holding its own guard.
        const enemyKicking = entity.components.kick.value;
        const enemyWantsAttack =
          entity.components.isAttacking.value || enemyKicking;

        if (
          distance < 100 &&
          enemyWantsAttack &&
          !entity.components.block.value &&
          entity.components.attackCooldown.value <= 0 &&
          !isKnockedDown(entity) &&
          !isKnockedDown(playerEntity)
        ) {
          // Kicks hit a little harder than punches.
          const rawDamage = enemyKicking
            ? Math.floor(Math.random() * 5) + 2
            : Math.floor(Math.random() * 4) + 1;
          const isBlocking = playerEntity.components.block.value;
          const dealt = isBlocking
            ? Math.max(1, Math.floor(rawDamage / 2))
            : rawDamage;
          playerEntity.components.health.value -= dealt;
          playerEntity.components.spriteState.value = isBlocking ? "block" : "hit";
          playerEntity.components.spriteTimer.value = hitFrames;
          entity.components.attackCooldown.value =
            fps / 1.5 + Math.random() * (2.5 - 1.5);

          entity.components.spriteState.value = enemyKicking ? "kick" : "attack";
          entity.components.spriteTimer.value = attackFrames;

          knockback(playerEntity, entity, enemyKicking ? 22 : 16, isBlocking);
          impact(
            playerEntity,
            dealt,
            isBlocking ? "block" : enemyKicking ? "kick" : "hit"
          );
        }

        // Animate the swing even on a whiff, mirroring the player's branch.
        if (!isKnockedDown(entity) && entity.components.spriteTimer.value <= 0) {
          if (entity.components.isAttacking.value) {
            playAnimation(entity, "attack");
            if (window.SFX) window.SFX.swing();
          } else if (enemyKicking) {
            playAnimation(entity, "kick");
            if (window.SFX) window.SFX.swing();
          }
        }

        entity.components.attackCooldown.value = Math.max(
          0,
          entity.components.attackCooldown.value - 1
        );
      }
    }

    return entity;
  });

  return newEntities;
};
