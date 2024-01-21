//enemy stats
let enemyPositionX = 900;
let enemyPositionY = 300;
let enemyHealth = 100;

const enemy = new Entity()
  .addComponents(new Component("name", "enemy"))
  .addComponents(new Component("positionX", enemyPositionX))
  .addComponents(new Component("positionY", enemyPositionY))
  .addComponents(new Component("up", false))
  .addComponents(new Component("left", false))
  .addComponents(new Component("right", false))
  .addComponents(new Component("down", false))
  .addComponents(new Component("jump", false))
  .addComponents(new Component("attackCooldown", 0))
  .addComponents(new Component("maxHealth", enemyHealth))
  .addComponents(new Component("speed", 1.7))
  .addComponents(new Component("isAttacking", false));
