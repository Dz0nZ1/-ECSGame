//Movement system
const movementSystem = (enteties) => {
  let newEnteties = [];
  let jumpSpeed = 10;
  let speed = 5;

  for (e of enteties) {
    let jumpHeight = 195;

    if (
      e.components.jump !== undefined &&
      e.components.positionY !== undefined
    ) {
      if (e.components.jump.value == true) {
        if (
          e.components.positionY.value >
          e.components.positionY.originalValue - jumpHeight
        ) {
          e.components.positionY.value -= jumpSpeed;
          jumpSpeed -= 0.3;
        } else {
          e.components.jump.value = false;
          jumpSpeed = 10;
          e.components.positionY.value = e.components.positionY.originalValue;
        }
      }
    }

    if (
      e.components.positionY !== undefined &&
      e.components.positionY.originalValue === undefined
    ) {
      e.components.positionY.originalValue = e.components.positionY.value;
    }

    if (e.components.up?.value && e.components.positionY.value > 195) {
      e.components.positionY.value -= speed;
      e.components.up.value = false;
    }
    if (e.components.down?.value && e.components.positionY.value < 500) {
      e.components.positionY.value += speed;
      e.components.down.value = false;
    }

    if (e.components.left?.value && e.components.positionX.value > -30) {
      e.components.positionX.value -= speed;
      e.components.left.value = false;
    }

    if (e.components.right?.value && e.components.positionX.value < 1300) {
      e.components.positionX.value += speed;
      e.components.right.value = false;
    }

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
            // console.log("UP button pressed!");
          }
        }
      }
      //down 40
      if (downEvents.includes(40)) {
        if (e.components.positionY != undefined) {
          if (e.components.name.value === "player") {
            e.components.down.value = true;
            // console.log("DOWN Button pressed!");
          }
        }
      }

      //left 37
      if (downEvents.includes(37)) {
        if (e.components.positionX != undefined) {
          if (e.components.name.value === "player") {
            e.components.left.value = true;
            // console.log("LEFT Button pressed!");
          }
        }
      }

      //right 39
      if (downEvents.includes(39)) {
        if (e.components.positionX != undefined) {
          if (e.components.name.value === "player") {
            e.components.right.value = true;
            // console.log("RIGHT Button pressed!");
          }
        }
      }
      //jump 23
      if (downEvents.includes(32) && !e.components.jump.value) {
        if (e.components.name.value === "player") {
          e.components.jump.value = true;
          // console.log("Jump button pressed!");
        }
      }

      if (downEvents.includes(65) && e.components.isAttacking !== undefined) {
        if (e.components.name.value === "player") {
          e.components.isAttacking.value = true;
          // console.log("Attack button pressed!");
        }
      }
      if (downEvents.includes(83) && e.components.kick !== undefined) {
        if (e.components.name.value === "player") {
          e.components.kick.value = true;
          // console.log("Kick button pressed!");
        }
      }

      newEntities.push(e);
    });
    downEvents = downEvents.filter((value) => !upEvents.includes(value));
    upEvents = [];
    return newEntities;
  };
})();
