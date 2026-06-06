//End game system
const endGameSystem = (entities) => {
  const playerHealth = entities.find(
    (e) => e.components.name.value === "player"
  ).components.health.value;
  const enemyHealth = entities.find((e) => e.components.name.value === "enemy")
    .components.health.value;

  if (playerHealth <= 0 || enemyHealth <= 0) {
    clearInterval(gameInterval);
    document.getElementById("game-over-screen").style.display = "block";
    document.getElementById("startGame").style.display = "none";
    document.getElementById("health-info").style.display = "none";

    const winner = document.getElementById("winner");

    if (playerHealth <= 0 && enemyHealth <= 0) {
      winner.innerText += " Draw: Now this was an awesome fight!";
      winner.style.color = "yellow";
    } else if (enemyHealth <= 0) {
      // Enemy is down -> player wins.
      if (playerHealth === 100) {
        winner.innerText += " Player win 100hp: Flawless victory!!!!";
      } else {
        winner.innerText += " Player win: Hey, you're pretty good!";
      }
      winner.style.color = "green";
    } else {
      // Player is down -> enemy wins.
      if (enemyHealth === 100) {
        winner.innerText += " Enemy win 100hp: WOW, you are so BAD!";
      } else {
        winner.innerText += " Enemy win: Better luck next time...";
      }
      winner.style.color = "red";
    }
  }

  return entities;
};
