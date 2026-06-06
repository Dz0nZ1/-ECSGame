//Movement system
const movementSystem = (enteties) => {
  let newEnteties = [];
  const speed = 5;
  const GRAVITY = 0.72;
  const JUMP_VELOCITY = 15;

  for (e of enteties) {
    // Jumping: velocity + gravity produce a smooth arc instead of a teleport.
    if (
      e.components.jump !== undefined &&
      e.components.jump.value &&
      e.components.groundY !== undefined
    ) {
      // Takeoff on the first airborne frame: remember the ground and launch.
      if (e.components.groundY.value === null) {
        e.components.groundY.value = e.components.positionY.value;
        e.components.velocityY.value = -JUMP_VELOCITY;
      }

      e.components.positionY.value += e.components.velocityY.value;
      e.components.velocityY.value += GRAVITY;

      // Landing: snap back to the ground and end the jump.
      if (e.components.positionY.value >= e.components.groundY.value) {
        e.components.positionY.value = e.components.groundY.value;
        e.components.velocityY.value = 0;
        e.components.groundY.value = null;
        e.components.jump.value = false;
      }
    }

    const airborne = e.components.jump !== undefined && e.components.jump.value;

    // Vertical plane movement (disabled while mid-jump).
    if (!airborne) {
      if (e.components.up?.value && e.components.positionY.value > 195) {
        e.components.positionY.value -= speed;
      }
      if (e.components.down?.value && e.components.positionY.value < 500) {
        e.components.positionY.value += speed;
      }
    }
    if (e.components.up) e.components.up.value = false;
    if (e.components.down) e.components.down.value = false;

    // Horizontal movement (air control is allowed), clamped to the playfield.
    const minX = window.playfield ? window.playfield.minX : -30;
    const maxX = window.playfield ? window.playfield.maxX : 1300;
    if (e.components.left?.value && e.components.positionX.value > minX) {
      e.components.positionX.value -= speed;
    }
    if (e.components.right?.value && e.components.positionX.value < maxX) {
      e.components.positionX.value += speed;
    }
    if (e.components.left) e.components.left.value = false;
    if (e.components.right) e.components.right.value = false;

    // Hard clamp so a movement step can't overshoot the playfield edge.
    e.components.positionX.value = Math.max(
      minX,
      Math.min(maxX, e.components.positionX.value)
    );

    newEnteties.push(e);
  }
  return newEnteties;
};

const userInputSystem = (function inputSystem() {
  let downEvents = [];
  let upEvents = [];
  function handleKeyDown(event) {
    downEvents.push(event.keyCode);
    downEvents = [...new Set(downEvents)];
  }
  function handleKeyUp(event) {
    upEvents.push(event.keyCode);
    upEvents = [...new Set(upEvents)];
  }
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  return (entities) => {
    let newEntities = [];
    entities.map((e) => {
      //up 38
      if (downEvents.includes(38)) {
        if (e.components.positionY != undefined) {
          if (e.components.name.value === "player") {
            e.components.up.value = true;
          }
        }
      }
      //down 40
      if (downEvents.includes(40)) {
        if (e.components.positionY != undefined) {
          if (e.components.name.value === "player") {
            e.components.down.value = true;
          }
        }
      }

      //left 37
      if (downEvents.includes(37)) {
        if (e.components.positionX != undefined) {
          if (e.components.name.value === "player") {
            e.components.left.value = true;
          }
        }
      }

      //right 39
      if (downEvents.includes(39)) {
        if (e.components.positionX != undefined) {
          if (e.components.name.value === "player") {
            e.components.right.value = true;
          }
        }
      }
      //jump 32
      if (downEvents.includes(32) && !e.components.jump.value) {
        if (e.components.name.value === "player") {
          e.components.jump.value = true;
        }
      }

      if (downEvents.includes(65) && e.components.isAttacking !== undefined) {
        if (e.components.name.value === "player") {
          e.components.isAttacking.value = true;
        }
      }
      if (downEvents.includes(83) && e.components.kick !== undefined) {
        if (e.components.name.value === "player") {
          e.components.kick.value = true;
        }
      }

      newEntities.push(e);
    });
    downEvents = downEvents.filter((value) => !upEvents.includes(value));
    upEvents = [];
    return newEntities;
  };
})();
