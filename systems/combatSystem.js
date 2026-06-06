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

  // Advance the attack/kick animation timer; revert to idle when it ends.
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
          entity.components.attackCooldown.value <= 0
        ) {
          enemyEntity.components.health.value -=
            Math.floor(Math.random() * 5) + 1;
          entity.components.attackCooldown.value = fps / 2;
        }

        // Trigger the matching animation whenever the player acts,
        // even if the hit misses.
        if (entity.components.spriteTimer.value <= 0) {
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

      // Consume the action inputs for this frame.
      entity.components.isAttacking.value = false;
      entity.components.kick.value = false;

      return entity;
    } else if (entity.components.name.value === "enemy") {
      const playerEntity = entities.find(
        (e) => e.components.name.value === "player"
      );

      if (playerEntity) {
        const distance = calculateDistance(entity, playerEntity);

        if (distance < 100 && entity.components.attackCooldown.value <= 0) {
          playerEntity.components.health.value -=
            Math.floor(Math.random() * 4) + 1;
          entity.components.attackCooldown.value =
            fps / 1.5 + Math.random() * (2.5 - 1.5);
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
