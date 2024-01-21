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

  const updatePlayerImage = (entity) => {
    if (
      entity.components.isAttacking !== undefined &&
      entity.components.isAttacking.value
    ) {
      playerImage.src = "./images/PlayerAttack.png";
      entity.components.isAttacking.value = false;
    } else if (
      entity.components.kick !== undefined &&
      entity.components.kick.value
    ) {
      playerImage.src = "./images/PlayerKick.png";
      entity.components.kick.value = false;
    } else {
      playerImage.src = "./images/Player.png";
    }
  };

  const newEntities = entities.map((entity) => {
    if (entity.components.name.value === "player") {
      const enemyEntity = entities.find(
        (e) => e.components.name.value === "enemy"
      );

      if (enemyEntity) {
        const distance = calculateDistance(entity, enemyEntity);

        console.log(entity.components.isAttacking.value);

        if (
          distance < 50 &&
          (entity.components.isAttacking.value ||
            entity.components.kick.value) &&
          entity.components.attackCooldown.value <= 0
        ) {
          enemyEntity.components.maxHealth.value -=
            Math.floor(Math.random() * 5) + 1;
          entity.components.isAttacking.value = false;
          console.log(
            "Player attacked enemy! Enemy health: " +
              enemyEntity.components.maxHealth.value
          );

          entity.components.attackCooldown.value = fps / 2;
        }

        entity.components.attackCooldown.value = Math.max(
          0,
          entity.components.attackCooldown.value - 1
        );
      }

      updatePlayerImage(entity);
      return entity;
    } else if (entity.components.name.value === "enemy") {
      const playerEntity = entities.find(
        (e) => e.components.name.value === "player"
      );

      if (playerEntity) {
        const distance = calculateDistance(entity, playerEntity);

        if (distance < 50 && entity.components.attackCooldown.value <= 0) {
          playerEntity.components.maxHealth.value -=
            Math.floor(Math.random() * 4) + 1;
          console.log(
            "Enemy attacked player! Player health: " +
              playerEntity.components.maxHealth.value
          );

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
