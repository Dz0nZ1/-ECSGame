//Init
(function init() {
  Entity.prototype._count = 0;
})();

//Game settings
let fps = 60;
// How many frames an attack/kick animation plays for.
let attackFrames = 18;

// ---- Difficulty presets (consumed by enemyAiSystem via window.aiConfig) ----
const DIFFICULTIES = {
  easy: { aggression: 0.55, blockChance: 0.3, speed: 1.3, gapMin: 0.35, gapMax: 0.9 },
  normal: { aggression: 0.8, blockChance: 0.55, speed: 1.7, gapMin: 0.18, gapMax: 0.6 },
  hard: { aggression: 0.95, blockChance: 0.72, speed: 2.2, gapMin: 0.1, gapMax: 0.38 },
};
window.aiConfig = DIFFICULTIES.normal;

// ---- Match / round state (read by roundSystem) ----
const ROUNDS_TO_WIN = 2; // best of 3
const ROUND_SECONDS = 60;
let playerWins = 0;
let enemyWins = 0;
let roundFramesLeft = 0;
let roundActive = false;
let roundTimeoutId = null;

// ---- Transient visual effects (drawn + decayed by renderingSystem) ----
window.fx = [];
window.fxShake = 0;

// Spawn a hit spark + floating damage number and kick off a screen shake.
function spawnHitFx(x, y, amount, kind) {
  const color =
    kind === "block" ? "#7fd0ff" : kind === "kick" ? "#ffd34d" : "#ff5e5e";
  window.fx.push({ type: "spark", x, y, life: 0, max: 12, color });
  window.fx.push({
    type: "dmg",
    x,
    y,
    vy: -1.1,
    life: 0,
    max: 38,
    text: kind === "block" ? "BLOCK" : String(amount),
    color,
  });
  window.fxShake = Math.min(
    10,
    window.fxShake + (kind === "block" ? 3 : kind === "kick" ? 9 : 7)
  );
}
window.spawnHitFx = spawnHitFx;

// Entities
const entities = [];
// Systems
const systems = [];

// Adding entities
entities.push(player);
entities.push(enemy);

//Adding systems
systems.push(statsSystem);
systems.push(roundSystem);
systems.push(renderingSystem);
systems.push(userInputSystem);
systems.push(movementSystem);
systems.push(enemyAiSystem);
systems.push(collisionSystem);
systems.push(combatSystem);

//Game loop
function game(entities, systems) {
  systems.forEach((s) => {
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

// Reflect the round scores as filled pips under each fighter's name.
const updateRoundPips = () => {
  const paint = (id, wins) => {
    const box = document.getElementById(id);
    if (!box) return;
    [...box.children].forEach((dot, i) => {
      dot.classList.toggle("won", i < wins);
    });
  };
  paint("player-rounds", playerWins);
  paint("enemy-rounds", enemyWins);
};

// Show / hide the big between-rounds banner.
const showBanner = (text) => {
  const b = document.getElementById("round-banner");
  if (!b) return;
  b.querySelector(".banner-text").innerText = text;
  b.style.display = "flex";
};
const hideBanner = () => {
  const b = document.getElementById("round-banner");
  if (b) b.style.display = "none";
};

// Start a single round: reset fighters, clock, and resume play.
const startRound = () => {
  clearTimeout(roundTimeoutId);
  resetFighters();
  enemy.components.speed.value = window.aiConfig.speed;
  roundFramesLeft = ROUND_SECONDS * fps;
  roundActive = true;
  window.fx = [];
  window.fxShake = 0;
  hideBanner();
  if (userInputSystem.clearBuffer) userInputSystem.clearBuffer();
  document.getElementById("round-timer").innerText = ROUND_SECONDS;
  if (window.SFX) window.SFX.roundStart();
  runLoop();
};

// End the current round, award the point, and either advance or finish.
const endRound = (result, reason) => {
  roundActive = false;
  clearInterval(gameInterval);
  if (reason === "ko" && window.SFX) window.SFX.ko();

  if (result === "player") playerWins++;
  else if (result === "enemy") enemyWins++;
  updateRoundPips();

  const matchOver =
    playerWins >= ROUNDS_TO_WIN || enemyWins >= ROUNDS_TO_WIN;
  if (matchOver) {
    endMatch();
    return;
  }

  const text =
    result === "player"
      ? "Round won!"
      : result === "enemy"
      ? "Round lost!"
      : "Draw round!";
  showBanner(text);
  roundTimeoutId = setTimeout(startRound, 1800);
};

// Finish the match: show the game-over modal with the final tally.
const endMatch = () => {
  hideBanner();
  inGameButtons.style.display = "none";
  document.getElementById("pause-screen").style.display = "none";

  const winner = document.getElementById("winner");
  if (playerWins > enemyWins) {
    winner.innerText = `You win the match ${playerWins}–${enemyWins}!`;
    winner.style.color = "#6dff5c";
  } else {
    winner.innerText = `You lose the match ${enemyWins}–${playerWins}.`;
    winner.style.color = "#ff5e5e";
  }
  document.getElementById("game-over-screen").style.display = "flex";
};

// Start a fresh match (scores to 0) at the selected difficulty.
const startMatch = () => {
  clearTimeout(roundTimeoutId);
  const sel = document.getElementById("difficulty");
  if (sel && DIFFICULTIES[sel.value]) window.aiConfig = DIFFICULTIES[sel.value];

  playerWins = 0;
  enemyWins = 0;
  updateRoundPips();

  document.getElementById("game-over-screen").style.display = "none";
  document.getElementById("health-info").style.display = "flex";
  inGameButtons.style.display = "flex";
  clearPause();
  startRound();
};

//Start game function
const startGame = () => {
  startButton.disabled = true;
  const sw = document.getElementById("start-wrap");
  if (sw) sw.classList.add("hidden");
  if (window.SFX) window.SFX.resume();
  startMatch();
};

// In-game restart: start the whole match over from round 1.
const inGameRestart = () => {
  startMatch();
};

// Pause / resume the running match without losing state.
const togglePause = () => {
  if (!roundActive && !isPaused) return; // nothing to pause between rounds
  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(gameInterval);
    document.getElementById("pauseLabel").innerText = "Resume";
    document.getElementById("pause-screen").style.display = "flex";
    if (userInputSystem.clearBuffer) userInputSystem.clearBuffer();
  } else {
    document.getElementById("pauseLabel").innerText = "Pause";
    document.getElementById("pause-screen").style.display = "none";
    if (userInputSystem.clearBuffer) userInputSystem.clearBuffer();
    runLoop();
  }
};

//Restart game function (from the game-over modal)
const restartGame = () => {
  startButton.disabled = true;
  startMatch();
};

// ---- Keyboard shortcuts: P pause, R restart, M mute ----
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.keyCode === 80) togglePause(); // P
  else if (e.keyCode === 82) {
    // R — only restart once a match has begun
    if (inGameButtons.style.display !== "none" && inGameButtons.style.display)
      inGameRestart();
  } else if (e.keyCode === 77) {
    // M — toggle mute
    if (window.SFX) {
      const muted = window.SFX.toggleMute();
      const btn = document.getElementById("muteLabel");
      if (btn) btn.innerText = muted ? "Unmute" : "Mute";
    }
  }
});
