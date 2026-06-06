//Stats system
const statsSystem = (entities) => {
  const getHealth = (type) => {
    const e = entities.find((x) => x.components.name.value === type);
    return e ? e.components.health.value : 0;
  };

  const clampPct = (v) => Math.max(0, Math.min(100, v));

  // Green when healthy, orange when hurt, red when nearly out.
  const colorFor = (pct) =>
    pct > 50
      ? "linear-gradient(90deg, #2fe430, #9dff5c)"
      : pct > 25
      ? "linear-gradient(90deg, #ffb020, #ffd84d)"
      : "linear-gradient(90deg, #e23b3b, #ff7a7a)";

  const playerPct = clampPct(getHealth("player"));
  const enemyPct = clampPct(getHealth("enemy"));

  const playerBar = document.getElementById("player-health-bar");
  const enemyBar = document.getElementById("enemy-health-bar");

  playerBar.style.width = playerPct + "%";
  playerBar.style.background = colorFor(playerPct);
  enemyBar.style.width = enemyPct + "%";
  enemyBar.style.background = colorFor(enemyPct);

  document.getElementById("player-health").innerText = Math.round(playerPct);
  document.getElementById("enemy-health").innerText = Math.round(enemyPct);

  return entities;
};
