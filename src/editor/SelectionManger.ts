import { Entity, Vector2D } from "../core";
import { AABB } from "../core/AABB";

export class SelectionManager {
  items: Entity[] = [];
  box?: AABB;
  startPos: Vector2D;
  endPos: Vector2D;

  constructor() {
    this.startPos = new Vector2D();
    this.endPos = new Vector2D();
  }

  setStartPos(v: Vector2D) {
    this.box = new AABB();
    this.startPos.set(v);
    this.endPos.set(v);
  }

  setEndPos(v: Vector2D) {
    this.endPos.set(v);
    this.box?.setFromTwoPoints(this.startPos, this.endPos);
  }

  clear() {
    this.items.length = 0;
  }

  set(item: Entity[] | Entity) {
    this.items.length = 0;
    if (Array.isArray(item)) {
      item.map((item) => this.items.push(item));
    } else {
      this.items.push(item);
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.box) return;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.strokeRect(
      this.box.pos.x - this.box.width / 2,
      this.box.pos.y - this.box.height / 2,
      this.box.width,
      this.box.height,
    );
    ctx.fillStyle = "#ffffffaa";
    ctx.fillRect(
      this.box.pos.x - this.box.width / 2,
      this.box.pos.y - this.box.height / 2,
      this.box.width,
      this.box.height,
    );
    ctx.restore();
  }
}
