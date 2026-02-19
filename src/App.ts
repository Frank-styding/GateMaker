import { AssetsManager, Engine, Entity, Vector2D } from "./core";
import { AndEntity } from "./Entities/gates/AndEntity";
import { NotEntity } from "./Entities/gates/NotEntity";
import { OrEntity } from "./Entities/gates/OrEntity";
import { NodeEntity } from "./Entities/Node";

export class App extends Engine {
  public init(): void {
    const size = 50;

    AssetsManager.setPatternContext(this.display.getContext());
    const pattern = AssetsManager.registerAsset("GRID", {
      width: size,
      height: size,
      pattern: true,
      builder: (ctx) => {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#e0e0e0";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, size);
        ctx.moveTo(0, 0);
        ctx.lineTo(size, 0);
        ctx.stroke();
      },
    })! as CanvasPattern;

    this.display.setPattern(pattern);
    this.display.setZoomLimits(0.3, 1.7);
    this.root.addChild(new AndEntity());
    const a = new AndEntity();
    a.pos.add(new Vector2D(200, 150));
    a.markDirty();
    this.root.addChild(a);
    const b = new NotEntity();
    b.pos.add(new Vector2D(300, 300));
    this.root.addChild(b);

    const c = new OrEntity();
    c.pos.add(new Vector2D(0, 400));
    this.root.addChild(c);

    this.display.panX = this.display.width / 2;
    this.display.panY = this.display.height / 2;
    this.display.zoom = 0.5;
  }

  protected initEvents(): void {
    let down = false;
    let hits: Entity[] = [];
    let item: Entity | null = null;
    this.mouse.on("down", (e) => {
      if (down) return;
      down = true;
      const v = new Vector2D(this.display.screenToWorld(e));
      hits.length = 0;
      Entity.collect(this.root, hits, (e) => e.getAABB().mouseIsInside(v));
      item = hits[0];
      if (item instanceof NodeEntity) {
        const result = item.isInsideConnection(v);
        if (!result || result.type != "box") {
          item = null;
        }
      }
    });

    this.mouse.on("up", (e) => {
      if (!down) return;
      if (item instanceof NodeEntity) {
        item.fixPos();
      }
      down = false;
      const v = new Vector2D(this.display.screenToWorld(e));
      hits.forEach((item) => item._mouseUp(v));
    });

    this.mouse.on("drag", (e) => {
      if (item) {
        const v = new Vector2D(
          this.display.screenToWorld({ x: e.dx!, y: e.dy! }, true),
        );
        item.pos.add(v);
      } else {
        this.display.onDrag(e);
      }
    });

    this.mouse.on("wheel", (e) => {
      this.display.onZoom(e);
    });
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    this.display.drawGrid();
  }
}
