//Init
(function init() {
  Entity.prototype._count = 0;
})();

//Game settings
let fps = 60;
// How many frames an attack/kick animation plays for.
let attackFrames = 18;

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
systems.push(collisionSystem);
systems.push(combatSystem);

//Game loop
function game(entities, systems) {
  systems.map((s) => {
    entities = s(Object.freeze(entities));
  });
}

let gameInterval;
let isPaused = false;
let startButton = document.getElementById("startGame");
let inGameButtons = document.getElementById("ingameButtons");

// Reset the pause toggle back to the running state (UI + flag).
const clearPause = () => {
  isPaused = false;
  document.getElementById("pauseLabel").innerText = "Pause";
  document.getElementById("pause-screen").style.display = "none";
};

// Reset both fighters back to their starting state.
const resetFighters = () => {
  player.components.positionX.value = positionX;
  player.components.positionY.value = positionY;
  player.components.health.value = health;
  player.components.spriteState.value = "idle";
  player.components.spriteTimer.value = 0;
  player.components.block.value = false;
  player.components.jump.value = false;
  player.components.velocityY.value = 0;
  player.components.groundY.value = null;

  enemy.components.positionX.value = enemyPositionX;
  enemy.components.positionY.value = enemyPositionY;
  enemy.components.health.value = enemyHealth;
  enemy.components.spriteState.value = "idle";
  enemy.components.spriteTimer.value = 0;
};

// (Re)start the game loop from a clean interval.
const runLoop = () => {
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    game(entities, systems);
  }, 1000 / fps);
};

//Start game function
const startGame = () => {
  startButton.disabled = true;
  inGameButtons.style.display = "flex";
  clearPause();
  resetFighters();
  runLoop();
};

// In-game restart: reset the fight and keep playing immediately.
const inGameRestart = () => {
  clearPause();
  resetFighters();
  runLoop();
};

// Pause / resume the running match without losing state.
const togglePause = () => {
  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(gameInterval);
    document.getElementById("pauseLabel").innerText = "Resume";
    document.getElementById("pause-screen").style.display = "flex";
  } else {
    document.getElementById("pauseLabel").innerText = "Pause";
    document.getElementById("pause-screen").style.display = "none";
    runLoop();
  }
};

//Restart game function (from the game-over modal)
const restartGame = () => {
  clearInterval(gameInterval);
  startButton.disabled = false;

  resetFighters();

  clearPause();
  document.getElementById("game-over-screen").style.display = "none";
  document.getElementById("startGame").style.display = "block";
  document.getElementById("winner").innerText = "Game Over!";
  document.getElementById("health-info").style.display = "flex";
  inGameButtons.style.display = "none";

  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  game(entities, systems);
};
