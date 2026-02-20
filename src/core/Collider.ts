import { Vector2D } from "./Vector";

export interface Collider {
  mouseIsInside(pos: Vector2D): boolean;
  draw(ctx: CanvasRenderingContext2D): void;
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
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.strokeRect(
      this.center.x - this.halfW,
      this.center.y - this.halfH,
      this.width,
      this.height,
    );
  }

  updateData(width: number, height: number, pos: Vector2D, angle: number = 0) {
    this.width = width;
    this.height = height;
    this.center.copy(pos);
    this.angle = angle;
    this.halfW = width / 2;
    this.halfH = height / 2;
  }

  mouseIsInside(p: Vector2D): boolean {
    const v = p.clone().subtract(this.center).rotate(-this.angle);
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
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.lineWidth = this.height;
    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = "red";
    ctx.stroke();
  }

  updateData(path: Vector2D[], height?: number) {
    this.path = path;
    if (height) this.height = height;
  }

  mouseIsInside(pos: Vector2D): boolean {
    const r = this.height * 0.5;
    const r2 = r * r;

    const px = pos.x;
    const py = pos.y;

    for (let i = 0; i < this.path.length - 1; i++) {
      const ax = this.path[i].x;
      const ay = this.path[i].y;
      const bx = this.path[i + 1].x;
      const by = this.path[i + 1].y;
      const vx = bx - ax;
      const vy = by - ay;
      const wx = px - ax;
      const wy = py - ay;
      const c1 = wx * vx + wy * vy;
      const c2 = vx * vx + vy * vy;
      let t = c1 / c2;
      if (t < 0) t = 0;
      else if (t > 1) t = 1;
      const projx = ax + t * vx;
      const projy = ay + t * vy;
      const dx = px - projx;
      const dy = py - projy;
      if (dx * dx + dy * dy <= r2) return true;
    }

    return false;
  }
}
