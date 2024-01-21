// Entity creator
function Entity() {
  Entity.prototype._count++;
  this.id = Entity.prototype._count;
  this.components = {};
  this.addComponents = function addComponent(c) {
    this.components[c.name] = c;
    return this;
  };
  this.removeComponents = function removeComponent(c) {
    delete this.components[c.name];
    return this;
  };
}
