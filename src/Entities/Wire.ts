import { Entity, LineCollider, Vector2D } from "../core";
import { GridManager } from "../editor/GridManager";

export class Wire extends Entity {
  static LINE_HEIGHT: number = 14;

  constructor(public path: Vector2D[] = []) {
    super();
    this.layerIdx = 0;
  }

  protected init(): void {
    this.collider = new LineCollider(this.path, Wire.LINE_HEIGHT);
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
    const pad = Wire.LINE_HEIGHT / 2;
    this.bounding.width = maxX - minX + pad * 2;
    this.bounding.height = maxY - minY + pad * 2;
    this.bounding.pos.set((maxX + minX) / 2, (maxY + minY) / 2);
  }

  public moveLastPoint(pos: Vector2D) {
    const a = this.path[this.path.length - 1];
    const b = this.path[this.path.length - 2];
    const v = pos.clone().subtract(b);
    const angle = v.angle();
    const range = Math.PI / 4;
    a.set(pos.x, pos.y);
    if (
      (-range < angle && angle < range) ||
      angle < -range * 3 ||
      angle > range * 3
    ) {
      a.set(pos.x, b.y);
    }

    if (
      (range < angle && angle < range * 3) ||
      (-3 * range < angle && angle < -range)
    ) {
      a.set(b.x, pos.y);
    }
    Wire.adjustPos(a);
  }

  static adjustPos(p: Vector2D) {
    const cellSize = GridManager.CELL_SIZE;
    p.y = Math.floor(p.y / cellSize) * cellSize;
    p.x = Math.floor(p.x / cellSize) * cellSize;
    p.x += cellSize / 2;
    p.y += cellSize / 2;
  }

  protected updateCollider(): void {}
  protected render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = Wire.LINE_HEIGHT;
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
