const enemyAiSystem = (entities) => {
  let newEntities = [];

  entities.map((e) => {
    if (e.components.name.value === "enemy") {
      let playerEntity = entities.find(
        (entity) => entity.components.name.value === "player"
      );

      if (playerEntity) {
        if (
          e.components.positionX.value <
          playerEntity.components.positionX.value - 50
        ) {
          e.components.positionX.value += e.components.speed.value;
        } else if (
          e.components.positionX.value >
          playerEntity.components.positionX.value + 50
        ) {
          e.components.positionX.value -= e.components.speed.value;
        }

        if (
          e.components.positionY.value <
          playerEntity.components.positionY.value - 10
        ) {
          e.components.positionY.value += e.components.speed.value;
        } else if (
          e.components.positionY.value >
          playerEntity.components.positionY.value + 10
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
          distance < 50 && !e.components.isAttacking.value ? true : false;
      }

      enemyImage.src = e.components.isAttacking.value
        ? "./images/EnemyAttack.png"
        : "./images/Enemy.png";
    }

    newEntities.push(e);
  });

  return newEntities;
};
