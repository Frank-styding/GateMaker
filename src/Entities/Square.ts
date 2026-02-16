import { BoxCollider } from "../core/Collider.js";
import { Entity } from "../core/Entity.js";

export class $$Square extends Entity {
  constructor(
    public width: number,
    public height: number,
  ) {
    super();
  }

  protected start(): void {
    this.collider = new BoxCollider(this.width, this.height, this.pos);
  }

  protected updateBounding(): void {
    this.bounding.width = this.width;
    this.bounding.height = this.height;
    this.bounding.pos = this.pos;
  }

  protected updateCollider(): void {
    (this.collider as BoxCollider).updateData(
      this.width,
      this.height,
      this.pos,
    );
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.fillStyle = "red";
    ctx.fillRect(-50, -50, 100, 100);
  }
}
