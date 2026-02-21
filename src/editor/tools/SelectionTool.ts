import {
  type MouseData,
  Entity,
  Vector2D,
  RenderLayer,
  Engine,
  MouseButton,
} from "../../core";
import { AABB } from "../../core/AABB";
import { NodeEntity } from "../../Entities/NodeEntity";
import { GridManager } from "../GridManager";
import type { Tool, ToolContext } from "./ToolManager";

export class SelectionTool implements Tool {
  name = "selection";
  lock = true;

  start!: Vector2D;
  end!: Vector2D;
  box!: AABB;
  display!: RenderLayer;
  root!: Entity;
  out!: Entity[];

  active = false;
  draggingSelection = false;
  lastMouse!: Vector2D;

  unLock!: () => void;

  init(ctx: ToolContext): void {
    this.display = ctx.display;
    this.root = ctx.root;
    this.out = [];
    this.unLock = ctx.unLock;

    this.start = new Vector2D();
    this.end = new Vector2D();
    this.box = new AABB();
    this.lastMouse = new Vector2D();
  }

  // ---------------- MOUSE DOWN ----------------
  onDown(e: MouseData, hit?: Entity): void {
    if (e.button != MouseButton.LEFT) return;
    const v = this.display.screenToWorldVector(e);

    // 1️⃣ Click inside selection box → drag group
    if (this.active && this.box.mouseIsInside(v)) {
      this.draggingSelection = true;
      this.lastMouse.set(v);
      return;
    }

    // 2️⃣ Single entity selection via HIT
    if (hit) {
      this.out.length = 0;
      this.out.push(hit);

      this.box.set(hit.getAABB());
      this.active = true;
      this.draggingSelection = true;
      this.lastMouse.set(v);
      return;
    }

    // 3️⃣ Start area selection
    this.active = false;
    this.draggingSelection = false;

    this.start.set(v);
    this.end.set(v.clone());
    this.box.setFromTwoPoints(this.start, this.end);
  }

  // ---------------- DRAG ----------------
  onDrag(e: MouseData): void {
    if (e.button != MouseButton.LEFT) return;
    const v = this.display.screenToWorldVector(e);

    // Move selected entities
    if (this.draggingSelection) {
      const dx = v.x - this.lastMouse.x;
      const dy = v.y - this.lastMouse.y;

      for (const ent of this.out) {
        ent.pos.x += dx;
        ent.pos.y += dy;
        ent.markDirty();
      }

      // Move selection box too
      this.box.pos.x += dx;
      this.box.pos.y += dy;

      this.lastMouse.set(v);
      return;
    }

    // Normal selection drag
    this.end.set(v);
    this.box.setFromTwoPoints(this.start, this.end);
  }

  // ---------------- UP ----------------
  onUp(e: MouseData): void {
    if (this.draggingSelection) {
      this.out.forEach((item) => {
        GridManager.snap(item.pos);
        NodeEntity.adjustPos(item as NodeEntity);
        item.markDirty();
      });
      this.box.set(Entity.calcBounding(this.out));
    }

    if (!this.draggingSelection) {
      // collect entities inside box
      this.out.length = 0;
      Entity.collect(this.root, this.out, (item) =>
        this.box.containsAABB(item.getAABB()),
      );

      if (this.out.length == 0) {
        this.unLock();
        this.active = false;
      } else {
        this.active = true;
        this.box.set(Entity.calcBounding(this.out));
      }
    }

    this.draggingSelection = false;
  }

  // ---------------- RENDER ----------------
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.box) return;

    const { pos, width, height } = this.box;

    if (this.active) {
      ctx.save();
      ctx.setLineDash([6, 3]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      const padding = 10;
      ctx.strokeRect(
        pos.x - width / 2 - padding,
        pos.y - height / 2 - padding,
        width + padding * 2,
        height + padding * 2,
      );
      ctx.restore();
    } else {
      ctx.save();
      ctx.strokeStyle = "black";
      ctx.fillStyle = "#61616149";
      ctx.strokeRect(pos.x - width / 2, pos.y - height / 2, width, height);
      ctx.fillRect(pos.x - width / 2, pos.y - height / 2, width, height);
      ctx.restore();
    }
  }
}
