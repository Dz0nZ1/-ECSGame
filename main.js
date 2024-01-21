//Init
(function init() {
  Entity.prototype._count = 0;
})();

//Game settings
let fps = 60;

// Entities
const entities = [];
// Systems
const systems = [];

// Adding entities
entities.push(player);
entities.push(enemy);

//Adding systems
systems.push(statsSystem);
systems.push(endGameSystem);
systems.push(renderingSystem);
systems.push(userInputSystem);
systems.push(movementSystem);
systems.push(enemyAiSystem);
systems.push(combatSystem);

//Game loop
function game(entities, systems) {
  systems.map((s) => {
    entities = s(Object.freeze(entities));
  });
}

let gameInterval;
let startButton = document.getElementById("startGame");

//Start game function
const startGame = () => {
  startButton.disabled = true;
  gameInterval = setInterval(() => {
    game(entities, systems);
  }, 1000 / fps);
};

//Restart game function
const restartGame = () => {
  clearInterval(gameInterval);
  startButton.disabled = false;

  player.components.positionX.value = positionX;
  player.components.positionY.value = positionY;
  player.components.maxHealth.value = health;

  enemy.components.positionX.value = enemyPositionX;
  enemy.components.positionY.value = enemyPositionY;
  enemy.components.maxHealth.value = enemyHealth;

  document.getElementById("game-over-screen").style.display = "none";
  document.getElementById("startGame").style.display = "block";
  document.getElementById("winner").innerText = "Game Over!";
  document.getElementById("health-info").style.display = "flex";

  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  game(entities, systems);
};
