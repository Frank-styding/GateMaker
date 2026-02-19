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

  mouseIsInside(pos: Vector2D): boolean {
    return (
      pos.x >= this.left &&
      pos.x <= this.right &&
      pos.y >= this.top &&
      pos.y <= this.bottom
    );
  }

  collideAABB(b: AABB): boolean {
    return AABB.collideAABB(this, b);
  }

  // Colisión entre dos AABB
  static collideAABB(a: AABB, b: AABB): boolean {
    return !(
      a.right < b.left ||
      a.left > b.right ||
      a.bottom < b.top ||
      a.top > b.bottom
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
