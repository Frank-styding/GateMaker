import { Entity, LineCollider, Vector2D } from "../core";
import { NodeEntity } from "./Node";

export class Wire extends Entity {
  constructor(
    public path: Vector2D[],
    public height: number,
  ) {
    super();
  }

  protected init(): void {
    this.collider = new LineCollider(this.path, this.height);
  }
  protected updateBounding(): void {
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let minY = Infinity;

    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (maxX < p.x) maxX = p.x;
      if (maxY < p.y) maxY = p.y;
      if (minX > p.x) minX = p.x;
      if (minY > p.y) minY = p.y;
    }
    const pad = this.height / 2;
    this.bounding.width = maxX - minX + pad * 2;
    this.bounding.height = maxY - minY + pad * 2;
    this.bounding.pos = new Vector2D((maxX + minX) / 2, (maxY + minY) / 2);
  }

  static adjustPos(p: Vector2D) {
    const cellSize = NodeEntity.CELL_SIZE;
    p.x += cellSize / 2;
    p.y += cellSize / 2;
  }

  protected updateCollider(): void {}
  protected draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = this.height;
    ctx.lineJoin = "round";
    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (i == 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  }
}
