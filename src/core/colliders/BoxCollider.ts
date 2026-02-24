import { Vector2D } from "../Vector";
import type { Collider } from "./Collider";
import { mouseInsideBox } from "./mouseInsideBox";

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
    ctx.save();
    ctx.strokeStyle = "green";
    ctx.strokeRect(
      this.center.x - this.halfW,
      this.center.y - this.halfH,
      this.width,
      this.height,
    );
    ctx.restore();
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
    return mouseInsideBox(this.center, p, this.halfW, this.halfH, this.angle);
  }
}
