//End game system
const endGameSystem = (entities) => {
  const playerHealth = entities.find(
    (e) => e.components.name.value === "player"
  ).components.maxHealth.value;
  const enemyHealth = entities.find((e) => e.components.name.value === "enemy")
    .components.maxHealth.value;

  if (playerHealth <= 0 || enemyHealth <= 0) {
    clearInterval(gameInterval);
    document.getElementById("game-over-screen").style.display = "block";
    document.getElementById("startGame").style.display = "none";
    document.getElementById("health-info").style.display = "none";
    if (playerHealth > enemyHealth) {
      document.getElementById("winner").innerText +=
        " Player win: Hey, you're pretty good!";
      document.getElementById("winner").style.color = "green";
    } else if (playerHealth == enemyHealth) {
      document.getElementById("winner").style.color = "yellow";
      document.getElementById("winner").innerText +=
        " Draw: Now this was an awesome fight!";
    } else if (playerHealth == 100) {
      document.getElementById("winner").innerText +=
        " Player win 100hp: Flawless victory!!!!";
      document.getElementById("winner").style.color = "green";
    } else if (enemyHealth == 100) {
      document.getElementById("winner").innerText +=
        " Enemy win 100hp: WOW, you are so BAD!";
      document.getElementById("winner").style.color = "red";
    } else {
      document.getElementById("winner").innerText +=
        " Enemy win: Better luck next time...";
      document.getElementById("winner").style.color = "red";
    }

    clearInterval(game);
  }

  return entities;
};
