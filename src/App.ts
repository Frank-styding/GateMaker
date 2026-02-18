import { AssetsManager, Engine, Entity, Vector2D } from "./core";
import { $$Node } from "./Entities/Node";
import { $$Square } from "./Entities/Square";

export class App extends Engine {
  constructor() {
    super();
  }

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
    this.root.addChild(new $$Node());
    this.display.panX = this.display.width / 2;
    this.display.panY = this.display.height / 2;
  }

  protected initEvents(): void {
    let down = false;
    this.mouse.on("drag", (e) => {
      this.display.onDrag(e);
    });
    this.mouse.on("wheel", (e) => {
      this.display.onZoom(e);
    });
    let hits: Entity[] = [];
    this.mouse.on("down", (e) => {
      if (down) return;
      //this.display.onDown(e);
      down = true;
      const pos = this.display.screenToWorld(e.x, e.y);
      const v = new Vector2D(pos.x, pos.y);
      hits = Entity.traveler(this.root, {
        func: (item) => item.getAABB().mouseIsInside(v),
      });
      for (let i = 0; i < hits.length; i++) {
        const item = hits[i];
        if (item instanceof $$Node) {
          item.isInsideConnection(v);
        }
      }
    });
    this.mouse.on("up", (e) => {
      if (!down) return;
      down = false;
      //this.display.onUp(e);
      /*       const pos = this.display.screenToWorld(e.x, e.y);
      const v = new Vector2D(pos.x, pos.y);
      hits.forEach((item) => item._mouseUp(v)); */
    });
    /*    this.mouse.on("down", (e) => {
      if (down) return;
      down = true;
      const pos = this.display.screenToWorld(e.x, e.y);
      const v = new Vector2D(pos.x, pos.y);
      hits = Entity.traveler(this.root, {
        func: (item) => item.getAABB().mouseIsInside(v),
      }).filter((item) => item.getCollider()?.mouseIsInside(v));
      hits.forEach((item) => item._mouseDown(v));
     });
    this.mouse.on("up", (e) => {
      if (!down) return;
      down = false;
      const pos = this.display.screenToWorld(e.x, e.y);
      const v = new Vector2D(pos.x, pos.y);
      hits.forEach((item) => item._mouseUp(v));
    }); */
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    this.display.drawGrid();
  }
}
