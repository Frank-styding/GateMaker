import { Vector2D } from "./Vector";

export class AABB {
  constructor(
    public width: number = 0,
    public height: number = 0,
    public pos: Vector2D = new Vector2D(), // top-left corner
  ) {}
  get left() {
    return this.pos.x - this.width / 2;
  }
  get right() {
    return this.pos.x + this.width / 2;
  }
  get top() {
    return this.pos.y - this.height / 2;
  }
  get bottom() {
    return this.pos.y + this.height / 2;
  }

  // Colisión entre dos AABB
  static collideAABB(a: AABB, b: AABB): boolean {
    return !(
      a.pos.x + a.width < b.pos.x || // a izquierda de b
      a.pos.x > b.pos.x + b.width || // a derecha de b
      a.pos.y + a.height < b.pos.y || // a arriba de b
      a.pos.y > b.pos.y + b.height // a abajo de b
    );
  }

  // Punto dentro del AABB
  static insideAABB(box: AABB, p: Vector2D): boolean {
    return (
      p.x >= box.pos.x &&
      p.x <= box.pos.x + box.width &&
      p.y >= box.pos.y &&
      p.y <= box.pos.y + box.height
    );
  }
}
