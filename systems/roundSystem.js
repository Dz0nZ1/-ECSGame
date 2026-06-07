// Round system — owns the round clock and decides when a round ends. It runs
// each tick while a round is active. Match/round bookkeeping (scores, the
// between-round flow) lives in main.js; this system only detects the end
// condition and hands the result to endRound().
const roundSystem = (entities) => {
  // roundActive / roundFramesLeft / endRound are defined in main.js (shared
  // global scope, same pattern combatSystem uses for fps/attackFrames).
  if (typeof roundActive === "undefined" || !roundActive) return entities;

  const healthOf = (name) => {
    const e = entities.find((x) => x.components.name.value === name);
    return e ? e.components.health.value : 0;
  };

  // Count the clock down and mirror it to the HUD (mm:ss-ish, just seconds).
  roundFramesLeft = Math.max(0, roundFramesLeft - 1);
  const secondsLeft = Math.ceil(roundFramesLeft / fps);
  const timerEl = document.getElementById("round-timer");
  if (timerEl) timerEl.innerText = secondsLeft;

  const playerHp = healthOf("player");
  const enemyHp = healthOf("enemy");

  if (playerHp <= 0 || enemyHp <= 0) {
    // A knockout ends the round immediately.
    const result =
      playerHp <= 0 && enemyHp <= 0 ? "draw" : enemyHp <= 0 ? "player" : "enemy";
    endRound(result, "ko");
  } else if (roundFramesLeft <= 0) {
    // Time over — the fighter with more health takes the round.
    const result = playerHp > enemyHp ? "player" : enemyHp > playerHp ? "enemy" : "draw";
    endRound(result, "time");
  }

  return entities;
};
