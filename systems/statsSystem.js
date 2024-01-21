//Stats system
const statsSystem = (entities) => {
  const getHealth = (type) =>
    entities
      .filter((e) => e.components.name.value === type)
      .map((e) => e.components.maxHealth.value);

  const playerHealth = getHealth("player");
  const enemyHealth = getHealth("enemy");

  document.getElementById("player-health").innerText = playerHealth;
  document.getElementById("enemy-health").innerText = enemyHealth;

  return entities;
};
