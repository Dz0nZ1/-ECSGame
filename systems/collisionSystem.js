//Collision system: keep the two fighters from overlapping on the ground plane.
const collisionSystem = (entities) => {
  const player = entities.find((e) => e.components.name.value === "player");
  const enemy = entities.find((e) => e.components.name.value === "enemy");

  if (player && enemy) {
    const SPRITE_SIZE = 150;
    const BODY_WIDTH = 80; // effective body, narrower than the padded sprite
    const VERTICAL_REACH = 110; // closer than this vertically counts as a clash

    const pCenter = player.components.positionX.value + SPRITE_SIZE / 2;
    const eCenter = enemy.components.positionX.value + SPRITE_SIZE / 2;
    const dx = eCenter - pCenter;
    const absDx = Math.abs(dx);

    const dy = Math.abs(
      player.components.positionY.value - enemy.components.positionY.value
    );

    // Resolve only when bodies overlap horizontally AND are at a similar
    // height, so a fighter can still jump over the other.
    if (absDx < BODY_WIDTH && dy < VERTICAL_REACH) {
      const overlap = BODY_WIDTH - absDx;
      const dir = dx >= 0 ? 1 : -1; // enemy sits on the +dir side of the player
      const push = overlap / 2;

      enemy.components.positionX.value += dir * push;
      player.components.positionX.value -= dir * push;

      // Keep both inside the playfield bounds used by the movement system.
      const minX = window.playfield ? window.playfield.minX : -30;
      const maxX = window.playfield ? window.playfield.maxX : 1300;
      const clamp = (v) => Math.max(minX, Math.min(maxX, v));
      player.components.positionX.value = clamp(
        player.components.positionX.value
      );
      enemy.components.positionX.value = clamp(enemy.components.positionX.value);
    }
  }

  return entities;
};
