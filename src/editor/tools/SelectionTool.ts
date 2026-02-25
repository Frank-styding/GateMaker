import {
  Entity,
  MouseButton,
  RenderLayer,
  Vector2D,
  type MouseData,
} from "../../core";
import { AABB } from "../../core/AABB";
import { NodeEntity } from "../../Entities/NodeEntity";
import { Wire } from "../../Entities/wire/Wire";
import { AppEvents } from "../Events";
import { GridManager } from "../GridManager";
import type { Tool } from "./ToolManager";

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

  selectedNodes: NodeEntity[] = [];
  selectedWires: Wire[] = [];
  activeWires = new Map<string, Wire>();
  wireSelectionOnly = false;
  padding = 10;

  reset(): void {
    this.active = false;
    this.out.length = 0;
    this.draggingSelection = false;
    this.isWire = false;
    this.selectedNodes.length = 0;
    this.selectedWires.length = 0;
    this.wireSelectionOnly = false;
    this.activeWires.clear();
  }

  init(): void {
    this.display = AppEvents.get("display")!;
    this.grid = AppEvents.get("grid")!;
    this.root = AppEvents.get("root")!;
    this.out = [];
    this.start = new Vector2D();
    this.end = new Vector2D();
    this.box = new AABB();
    this.lastMouse = new Vector2D();
  }

  // ---------------- MOUSE DOWN ----------------
  onDown(e: MouseData, hit?: Entity): void {
    const v = this.display.screenToWorldVector(e);
    if (this.active && this.box.mouseIsInside(v) && !this.isWire) {
      this.draggingSelection = true;
      this.lastMouse.set(v);
      this.cacheSelection();
      return;
    }

    if (hit) {
      this.out.length = 0;
      this.out.push(hit);
      this.box.set(hit.getAABB());
      this.box.addPadding(this.padding);
      this.active = true;

      this.isWire = hit instanceof Wire;
      this.draggingSelection = !this.isWire;
      this.wireSelectionOnly = this.isWire;
      this.lastMouse.set(v);
      this.cacheSelection();

      return;
    }

    this.active = false;
    this.draggingSelection = false;
    this.isWire = false;
    this.wireSelectionOnly = false;
    this.selectedNodes.length = 0;
    this.selectedWires.length = 0;
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
      if (this.wireSelectionOnly) {
        AppEvents.emit("changeTool", { name: "edit_wire" });
        return;
      }

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

    const dx = v.x - this.lastMouse.x;
    const dy = v.y - this.lastMouse.y;
    if (dx === 0 && dy === 0) return;

    for (const node of this.selectedNodes) {
      node.pos.x += dx;
      node.pos.y += dy;
      node.markDirty();
    }

    for (const wire of this.activeWires) {
      //wire[1].fastUpdate();
      //wire[1].hide = true;
      wire[1].refreshPathLayout();
    }

    this.box.pos.x += dx;
    this.box.pos.y += dy;
    this.lastMouse.set(v);
  }

  // ---------------- UP ----------------
  onUp(): void {
    if (this.draggingSelection) {
      // Snap nodes
      for (const node of this.selectedNodes) {
        GridManager.snap(node.pos);
        NodeEntity.adjustPos(node);
        node.forceLayoutUpdate();
        this.grid.registerEntity?.(node);
      }
      /* for (const item of this.activeWires) {
        item[1].hide = false;
      } */
      this.activeWires.clear();
      this.box.set(Entity.calcBounding(this.out));
      this.box.addPadding(this.padding);
    }

    // Selection finalize
    if (!this.draggingSelection) {
      this.out.length = 0;
      Entity.collect(this.root, this.out, (item) =>
        this.box.containsAABB(item.getAABB())
      );

      if (this.out.length === 0) {
        AppEvents.emit("unLockTool");
        //this.unLock();
        this.active = false;
      } else {
        this.active = true;
        this.box.set(Entity.calcBounding(this.out));
        this.box.addPadding(this.padding);
      }
    }

    this.draggingSelection = false;
  }

  // ---------------- RENDER ----------------
  render(ctx: CanvasRenderingContext2D): void {
    const { pos, width, height } = this.box;
    if (this.active || this.wireSelectionOnly) {
      ctx.save();
      ctx.setLineDash([6, 3]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      const padding = 0;
      ctx.strokeRect(
        pos.x - width / 2 - padding,
        pos.y - height / 2 - padding,
        width + padding * 2,
        height + padding * 2
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
