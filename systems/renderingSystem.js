// Sprite sheets: one horizontal strip per animation state, uniform cells.
const SPRITES = {
  cellW: 106,
  cellH: 90,
  counts: { idle: 10, walk: 11, punch: 5, kick: 1, jump: 1 },
};

const sheets = { player: {}, enemy: {} };

function loadSheet(group, state, src) {
  const img = new Image();
  img.src = src;
  sheets[group][state] = img;
}

["idle", "walk", "punch", "kick", "jump"].forEach((state) => {
  loadSheet("player", state, `./images/sprites/p_${state}.png`);
  loadSheet("enemy", state, `./images/sprites/e_${state}.png`);
});

// Rendering system
const renderingSystem = (function graphicsSystem() {
  let canvas = document.createElement("canvas");
  canvas.width = window.innerWidth / 1.3;
  canvas.height = window.innerHeight / 1.5;
  canvas.style =
    "position: absolute; top: 56%; left: 50%; transform: translate(-50%, -50%); border: 4px solid #1a1a2e; border-radius: 10px; box-shadow: 0 16px 50px rgba(0, 0, 0, 0.6);";
  document.body.appendChild(canvas);

  // Playfield bounds derived from the actual canvas width so fighters can't
  // walk off-screen. The logical character box is 150 wide.
  window.playfield = { minX: 0, maxX: Math.max(200, canvas.width - 150) };

  let ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false; // keep the pixel art crisp

  let background = new Image();
  background.src = "./images/background.png";

  const BOX = 150; // the logical character box used by the rest of the game

  const drawBackground = () => {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  };

  // Draw one animation cell, scaled to the logical box, bottom-centered,
  // mirrored when the fighter faces left.
  const drawFrame = (img, frameIndex, x, y, flip) => {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const { cellW, cellH } = SPRITES;
    const scale = BOX / cellH;
    const dW = cellW * scale;
    const dH = cellH * scale;
    const dx = x + BOX / 2 - dW / 2;
    const dy = y + BOX - dH;
    const sx = frameIndex * cellW;

    if (flip) {
      ctx.save();
      ctx.translate(dx + dW, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, 0, cellW, cellH, 0, 0, dW, dH);
      ctx.restore();
    } else {
      ctx.drawImage(img, sx, 0, cellW, cellH, dx, dy, dW, dH);
    }
  };

  let frame = 0;
  const lastX = {};

  // Pick the attack frame from how far through the attack window we are.
  const attackFrameIndex = (entity, state) => {
    const timer = entity.components.spriteTimer
      ? entity.components.spriteTimer.value
      : 0;
    const n = SPRITES.counts[state];
    const progress = 1 - Math.max(0, Math.min(1, timer / attackFrames));
    return Math.max(0, Math.min(n - 1, Math.floor(progress * n)));
  };

  return (entities) => {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    const player = entities.find((e) => e.components.name.value === "player");
    const enemy = entities.find((e) => e.components.name.value === "enemy");

    entities.map((e) => {
      const name = e.components.name.value;
      if (name !== "player" && name !== "enemy") return;
      if (e.components.positionX === undefined) return;

      const x = e.components.positionX.value;
      const y = e.components.positionY.value;

      const airborne = e.components.jump !== undefined && e.components.jump.value;
      const ss = e.components.spriteState
        ? e.components.spriteState.value
        : "idle";

      const prevX = lastX[name] === undefined ? x : lastX[name];
      const moving = Math.abs(x - prevX) > 0.3;
      lastX[name] = x;

      // Resolve which animation + frame to show.
      const phase = name === "enemy" ? 4 : 0;
      let state, idx;
      if (airborne) {
        state = "jump";
        idx = 0;
      } else if (ss === "attack") {
        state = "punch";
        idx = attackFrameIndex(e, "punch");
      } else if (ss === "kick") {
        state = "kick";
        idx = attackFrameIndex(e, "kick");
      } else if (moving) {
        state = "walk";
        idx = Math.floor(frame / 5 + phase) % SPRITES.counts.walk;
      } else {
        state = "idle";
        idx = Math.floor(frame / 8 + phase) % SPRITES.counts.idle;
      }

      // Ken faces left by default; mirror when the opponent is on the right.
      let flip = false;
      if (name === "player" && enemy) {
        flip = enemy.components.positionX.value > x;
      } else if (name === "enemy" && player) {
        flip = player.components.positionX.value > x;
      }

      drawFrame(sheets[name][state], idx, x, y, flip);
    });

    return entities;
  };
})();
