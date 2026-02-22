import {
  Entity,
  MouseButton,
  RenderLayer,
  Vector2D,
  type MouseData,
} from "../../core";
import { AABB } from "../../core/AABB";
import { NodeEntity } from "../../Entities/NodeEntity";
import { Wire } from "../../Entities/Wire";
import { GridManager } from "../GridManager";
import type { Tool, ToolContext } from "./ToolManager";

export class SelectionTool implements Tool {
  name = "selection";
  lock = true;

  start!: Vector2D;
  end!: Vector2D;
  box!: AABB;
  display!: RenderLayer;
  grid!: GridManager;
  root!: Entity;
  out!: Entity[];

  active = false;
  draggingSelection = false;
  lastMouse!: Vector2D;
  isWire!: boolean;

  unLock!: () => void;
  private selectedNodes: NodeEntity[] = [];
  private selectedWires: Wire[] = [];
  private activeWires = new Map<string, Wire>();
  wireSelectionOnly = false;
  init(ctx: ToolContext): void {
    this.display = ctx.display;
    this.root = ctx.root;
    this.grid = ctx.grid;
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

    // Drag selection box
    if (this.active && this.box.mouseIsInside(v) && !this.isWire) {
      this.draggingSelection = true;
      this.lastMouse.set(v);
      this.cacheSelection();
      return;
    }

    // Single entity selection
    if (hit) {
      this.out.length = 0;
      this.out.push(hit);
      this.box.set(hit.getAABB());
      this.active = true;

      this.isWire = hit instanceof Wire;
      this.draggingSelection = !this.isWire; // ❗ wires can't drag
      this.wireSelectionOnly = this.isWire;
      this.lastMouse.set(v);
      this.cacheSelection();

      return;
    }

    // Area selection start
    this.active = false;
    this.draggingSelection = false;
    this.isWire = false;
    this.wireSelectionOnly = false; // ✅
    this.start.set(v);
    this.end.set(v.clone());
    this.box.setFromTwoPoints(this.start, this.end);
  }

  // Cache selected nodes & wires
  private cacheSelection() {
    this.selectedNodes.length = 0;
    this.selectedWires.length = 0;
    this.activeWires.clear();

    for (const e of this.out) {
      if (e instanceof NodeEntity) {
        this.selectedNodes.push(e);
      } else if (e instanceof Wire) {
        this.selectedWires.push(e);
      }
    }

    // Cache connected wires (NO hide here)
    for (const node of this.selectedNodes) {
      for (const w of node.getConnectedWires()) {
        if (!this.activeWires.has(w.id)) {
          this.activeWires.set(w.id, w);
        }
      }
    }
  }

  // ---------------- DRAG ----------------
  onDrag(e: MouseData): void {
    if (e.button !== MouseButton.LEFT) return;
    const v = this.display.screenToWorldVector(e);
    if (this.wireSelectionOnly) {
      this.wireSelectionOnly = false;
      this.active = false;
      this.draggingSelection = false;
      this.start.set(this.lastMouse);
      this.end.set(v);
      this.box.setFromTwoPoints(this.start, this.end);
      return;
    }
    // Selection rectangle drag
    if (!this.draggingSelection) {
      this.end.set(v);
      this.box.setFromTwoPoints(this.start, this.end);
      return;
    }

    // Hide wires ONLY during drag
    for (const wire of this.activeWires.values()) {
      wire.hide = true;
    }

    const dx = v.x - this.lastMouse.x;
    const dy = v.y - this.lastMouse.y;
    if (dx === 0 && dy === 0) return;

    for (const node of this.selectedNodes) {
      node.pos.x += dx;
      node.pos.y += dy;
      node.markDirty();
    }

    this.box.pos.x += dx;
    this.box.pos.y += dy;
    this.lastMouse.set(v);
  }

  // ---------------- UP ----------------
  onUp(e: MouseData): void {
    if (this.draggingSelection) {
      // Snap nodes
      for (const node of this.selectedNodes) {
        GridManager.snap(node.pos);
        NodeEntity.adjustPos(node);
        node.forceLayoutUpdate();
      }

      // Register nodes
      this.selectedNodes.forEach((item) => {
        this.grid.registerEntity?.(item);
      });

      // Recalc wires & show again
      for (const wire of this.activeWires.values()) {
        wire.recalc(this.grid);
        wire.forceLayoutUpdate();
        wire.hide = false;
      }

      this.activeWires.clear();
      this.box.set(Entity.calcBounding(this.out));
    }

    // Selection finalize
    if (!this.draggingSelection) {
      this.out.length = 0;
      Entity.collect(this.root, this.out, (item) =>
        this.box.containsAABB(item.getAABB()),
      );

      if (this.out.length === 0) {
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
    //if (this.wireSelectionOnly) return;
    if (this.active || this.wireSelectionOnly) {
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
