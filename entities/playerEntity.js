//player stats
let positionX = 300;
let positionY = 300;
let health = 100;

// Enitity initialization
const player = new Entity()
  .addComponents(new Component("name", "player"))
  .addComponents(new Component("positionX", positionX))
  .addComponents(new Component("positionY", positionY))
  .addComponents(new Component("up", false))
  .addComponents(new Component("left", false))
  .addComponents(new Component("right", false))
  .addComponents(new Component("down", false))
  .addComponents(new Component("jump", false))
  .addComponents(new Component("kick", false))
  .addComponents(new Component("attackCooldown", 0))
  .addComponents(new Component("maxHealth", health))
  .addComponents(new Component("isAttacking", false));
