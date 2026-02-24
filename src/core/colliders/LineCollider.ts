import type { Vector2D } from "../Vector";
import type { Collider } from "./Collider";
import { mosueInsidePath } from "./mosueInsidePath";

export class LineCollider implements Collider {
  constructor(
    public path: Vector2D[] = [],
    public height: number,
  ) {}
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = this.height;
    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = "green";
    ctx.stroke();
    ctx.restore();
  }

  updateData(path: Vector2D[], height?: number) {
    this.path = path;
    if (height) this.height = height;
  }

  mouseIsInside(pos: Vector2D): boolean {
    return mosueInsidePath(pos, this.path, this.height);
  }
}
