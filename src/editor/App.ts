import { Engine, Entity, Vector2D } from "../core";
import { MOUSE_BUTTONS } from "../core/MouseController";
import { AndEntity } from "../Entities/gates/AndEntity";
import { NotEntity } from "../Entities/gates/NotEntity";
import { OrEntity } from "../Entities/gates/OrEntity";
import { NodeEntity } from "../Entities/NodeEntity";
import { DragTool } from "./DragTool";
import { GridManager } from "./gridManager";
import { initGridPattern } from "./GridPattern";
import { SelectionManager } from "./SelectionManger";
import { ToolManager } from "./ToolManager";
import { WireTool } from "./WireTool";

export class App extends Engine {
  selection = new SelectionManager();
  wireTool = new WireTool();
  dragTool = new DragTool();
  tools = new ToolManager();

  public init(): void {
    const pattern = initGridPattern(this.display.getContext());
    this.display.setPattern(pattern);
    this.display.setZoomLimits(0.3, 1.7);

    this.display.panX = this.display.width / 2 - 200;
    this.display.panY = this.display.height / 2;
    this.display.zoom = 1;
    this.initComponents();
  }

  private initComponents() {
    const a = new AndEntity();
    const b = new AndEntity();
    const c = new AndEntity();
    const d = new NotEntity();
    const e = new OrEntity();

    a.pos.add(new Vector2D(300, 50));
    b.pos.add(new Vector2D(300, -150));
    c.pos.add(new Vector2D(0, -200));
    d.pos.add(new Vector2D(0, 150));

    this.root.addChild(a);
    this.root.addChild(b);
    this.root.addChild(c);
    this.root.addChild(d);
    this.root.addChild(e);
  }

  protected initEvents(): void {
    this.mouse.on("down", (e) => {
      if (e.button === MOUSE_BUTTONS.RIGHT) {
        this.selection.clear();
        this.wireTool.current = null;
        this.tools.current = "none";
        return;
      }
      if (this.tools.current == "selection") return;

      const v = this.display.screenToWorld(e);
      const hits: Entity[] = [];
      Entity.collect(this.root, hits, (ent) => ent.getAABB().mouseIsInside(v));
      hits.sort((a, b) => b.layerIdx - a.layerIdx);
      const item = hits.find((e) => e.getCollider()?.mouseIsInside(v));
      if (item) {
        if (item instanceof NodeEntity) {
          const hit = item.isInside(v);
          if (!hit) return;

          if (hit.type === "box" && !this.wireTool.current) {
            this.tools.current = "drag";
            this.selection.set(item);
          }

          if (hit.type === "connector") {
            this.tools.current = "wire";
            const p = new Vector2D(hit.x, hit.y);

            if (!this.wireTool.current) this.wireTool.start(item, hit.name!, p);
            else this.wireTool.finish(item, hit.name!, p, this.root);
          }
        }
      } else {
        if (this.tools.current == "wire") {
          this.wireTool.addPos(v);
        } else {
          this.tools.current = "selection";
          this.selection.setStartPos(v);
        }
      }
    });

    this.mouse.on("drag", (e) => {
      if (e.button === MOUSE_BUTTONS.MIDDLE) {
        this.display.onDrag(e);
        return;
      }
      const delta = this.display.screenToWorld({ x: e.dx!, y: e.dy! }, true);
      const pos = this.display.screenToWorld(e);
      if (this.tools.current === "drag") {
        this.dragTool.drag(this.selection.items, delta);
      } else if (this.tools.current == "selection") {
        this.selection.setEndPos(pos);
      }
    });

    this.mouse.on("up", () => {
      if (this.tools.current === "drag") {
        this.selection.items.forEach((item) => {
          GridManager.snap(item.pos);
          NodeEntity.adjustPos(item as NodeEntity);
          item.markDirty();
        });
        this.tools.current = "none";
      }
      if (this.tools.current == "selection") {
        this.tools.current = "none";
      }
    });

    this.mouse.on("move", (e) => {
      if (this.tools.current === "wire")
        this.wireTool.current?.wire.moveLastPoint(
          this.display.screenToWorld({ x: e.x!, y: e.y! }),
        );
    });

    this.mouse.on("wheel", (e) => this.display.onZoom(e));
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    this.display.drawGrid();
    this.wireTool.current?.wire._draw(ctx);
  }
  protected drawAfter(ctx: CanvasRenderingContext2D): void {
    if (this.tools.current == "selection") {
      this.selection.draw(ctx);
    }
  }
}
