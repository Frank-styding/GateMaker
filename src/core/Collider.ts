import { Vector2D } from "./Vector";

export interface Collider {
  mouseIsInside(pos: Vector2D): boolean;
}

export class BoxCollider implements Collider {
  private halfW = 0;
  private halfH = 0;
  constructor(
    public width: number,
    public height: number,
    public center = new Vector2D(),
    public angle: number = 0,
  ) {
    this.halfW = width / 2;
    this.halfH = height / 2;
  }

  updateData(width: number, height: number, pos: Vector2D, angle: number = 0) {
    this.width = width;
    this.height = height;
    this.center = pos;
    this.angle = angle;
    this.halfW = width / 2;
    this.halfH = height / 2;
  }

  mouseIsInside(p: Vector2D): boolean {
    const v = p.subtract(this.center).rotate(-this.angle);
    return (
      -this.halfW <= v.x &&
      v.x <= this.halfW &&
      -this.halfH <= v.y &&
      v.y <= this.halfH
    );
  }
}

export class LineCollider implements Collider {
  constructor(
    public path: Vector2D[] = [],
    public height: number,
  ) {}

  updateData(path: Vector2D[], height?: number) {
    this.path = path;
    if (height) this.height = height;
  }

  mouseIsInside(pos: Vector2D): boolean {
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i];
      const b = this.path[i + 1];
      const v = b.subtract(a);
      const d = v.length();
      if (d === 0) continue;
      const vn = v.normalize();
      const v1 = pos.subtract(a);
      const projection = vn.dot(v1);
      const distance = Math.abs(vn.cross(v1));
      if (distance <= this.height && projection >= 0 && projection <= d) {
        return true;
      }
    }
    return false;
  }
}
