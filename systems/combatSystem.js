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
          enemyEntity.components.health.value -=
            Math.floor(Math.random() * 5) + 1;
          entity.components.attackCooldown.value = fps / 2;
          enemyEntity.components.spriteState.value = "hit";
          enemyEntity.components.spriteTimer.value = hitFrames;
        }

        if (!isKnockedDown(entity) && entity.components.spriteTimer.value <= 0) {
          if (isAttacking) {
            playAnimation(entity, "attack");
          } else if (isKicking) {
            playAnimation(entity, "kick");
          }
        }

        entity.components.attackCooldown.value = Math.max(
          0,
          entity.components.attackCooldown.value - 1
        );
      }

      entity.components.isAttacking.value = false;
      entity.components.kick.value = false;
      entity.components.block.value = false;

      return entity;
    } else if (entity.components.name.value === "enemy") {
      tickAnimation(entity);

      const playerEntity = entities.find(
        (e) => e.components.name.value === "player"
      );

      if (playerEntity) {
        const distance = calculateDistance(entity, playerEntity);

        if (
          distance < 100 &&
          entity.components.attackCooldown.value <= 0 &&
          !isKnockedDown(entity)
        ) {
          const rawDamage = Math.floor(Math.random() * 4) + 1;
          const isBlocking = playerEntity.components.block.value;
          playerEntity.components.health.value -= isBlocking
            ? Math.max(1, Math.floor(rawDamage / 2))
            : rawDamage;
          playerEntity.components.spriteState.value = isBlocking ? "block" : "hit";
          playerEntity.components.spriteTimer.value = hitFrames;
          entity.components.attackCooldown.value =
            fps / 1.5 + Math.random() * (2.5 - 1.5);

          entity.components.spriteState.value = "attack";
          entity.components.spriteTimer.value = attackFrames;
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
