const enemyAiSystem = (entities) => {
  let newEntities = [];

  entities.map((e) => {
    if (e.components.name.value === "enemy") {
      let playerEntity = entities.find(
        (entity) => entity.components.name.value === "player"
      );

      // Advance the attack animation timer; revert to idle when it ends.
      if (e.components.spriteTimer.value > 0) {
        e.components.spriteTimer.value -= 1;
        if (e.components.spriteTimer.value <= 0) {
          e.components.spriteState.value = "idle";
        }
      }

      if (playerEntity) {
        if (
          e.components.positionX.value <
          playerEntity.components.positionX.value - 85
        ) {
          e.components.positionX.value += e.components.speed.value;
        } else if (
          e.components.positionX.value >
          playerEntity.components.positionX.value + 85
        ) {
          e.components.positionX.value -= e.components.speed.value;
        }

        if (
          e.components.positionY.value <
          playerEntity.components.positionY.value - 50
        ) {
          e.components.positionY.value += e.components.speed.value;
        } else if (
          e.components.positionY.value >
          playerEntity.components.positionY.value + 50
        ) {
          e.components.positionY.value -= e.components.speed.value;
        }

        let distance = Math.sqrt(
          Math.pow(
            playerEntity.components.positionX.value -
              e.components.positionX.value,
            2
          ) +
            Math.pow(
              playerEntity.components.positionY.value -
                e.components.positionY.value,
              2
            )
        );

        e.components.isAttacking.value =
          distance < 100 && !e.components.isAttacking.value ? true : false;

        if (e.components.isAttacking.value) {
          e.components.spriteState.value = "attack";
          e.components.spriteTimer.value = attackFrames;
        }
      }
    }

    newEntities.push(e);
  });

  return newEntities;
};
