//Images
let playerImage = new Image(150, 150);
let enemyImage = new Image(150, 150);

// Rendering system
const renderingSystem = (function graphicsSystem() {
  let canvas = document.createElement("canvas");
  canvas.width = window.innerWidth / 1.3;
  canvas.height = window.innerHeight / 1.5;
  canvas.style =
    "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border: 2px solid black;";
  document.body.appendChild(canvas);

  let ctx = canvas.getContext("2d");
  playerImage.onload = function () {
    renderingSystem(entities);
  };

  enemyImage.onload = function () {
    renderingSystem(entities);
  };

  playerImage.src = "./images/Player.png";
  enemyImage.src = "./images/Enemy.png";

  let background = new Image();
  background.src = "./images/background.png";

  const drawBackground = () => {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  };

  return (entities) => {
    ctx.clearRect(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    drawBackground();
    entities.map((e) => {
      {
        if (
          e.components.positionX !== undefined &&
          e.components.positionY !== undefined
        ) {
          if (e.components.name.value === "player") {
            ctx.drawImage(
              playerImage,
              e.components.positionX.value,
              e.components.positionY.value,
              150,
              150
            );
          }
          if (e.components.name.value === "enemy") {
            ctx.drawImage(
              enemyImage,
              e.components.positionX.value,
              e.components.positionY.value,
              150,
              150
            );
          }
        }
      }
    });
    return entities;
  };
})();
