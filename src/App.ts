import { AssetsManager, Engine, Entity, Vector2D } from "./core";
import { NodeEntity } from "./Entities/Node";
import { Wire } from "./Entities/Wire";

export class App extends Engine {
  wire!: Wire;
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

    this.wire = new Wire(
      [new Vector2D(0, 25), new Vector2D(50 * 2 + 25, 25)],
      18,
    );
    this.root.addChild(this.wire);
    //this.root.addChild(new AndEntity());
    //this.root.addChild(new AndEntity());
    //this.root.addChild(new AndEntity());
    /*       const a = new AndEntity();
      a.pos.add(new Vector2D(200, 150));
      a.markDirty(); */
    /*     
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
    */
    this.display.panX = this.display.width / 2;
    this.display.panY = this.display.height / 2;
    this.display.zoom = 0.5;
  }

  protected initEvents(): void {
    let down = false;
    let hits: Entity[] = [];
    let item: Entity | null = null;
    this.wire.path.push(new Vector2D(125, 50 * 5));
    this.mouse.on("down", (e) => {
      if (down) return;
      down = true;
      const p = this.display.screenToWorld(e);
      const l = this.wire.path;
      this.adjustToGrid(l[l.length - 1]);
      Wire.adjustPos(l[l.length - 1]);
      l.push(l[l.length - 1].clone());

      //l[l.length - 1].this.wire.addPoint(new Vector2D(e), true);

      /*       down = true;
      const v = this.display.screenToWorld(e);
      hits.length = 0;
      Entity.collect(this.root, hits, (e) => e.getAABB().mouseIsInside(v));

      item = hits[0];
      if (item instanceof NodeEntity) {
        const result = item.isInsideConnection(v);
        if (!result || result.type != "box") {
          item = null;
        }
      }

      if (item instanceof Wire && item.getCollider()?.mouseIsInside(v)) {
        console.log("mouse inside");
      } else {
        item = null;
      } */
    });

    this.mouse.on("up", (e) => {
      if (!down) return;
      down = false;
      /*       if (!down) return;
      if (item instanceof NodeEntity) {
        item.adjustPos();
      }
      down = false;
      const v = this.display.screenToWorld(e);
      hits.forEach((item) => item._mouseUp(v)); */
    });

    this.mouse.on("move", (e) => {
      const p = this.display.screenToWorld(e);
      const l = this.wire.path;
      l[l.length - 1].set(p);
      const a = l[l.length - 1].clone();
      const b = l[l.length - 2];
      const v = a.subtract(b);
      const range = Math.PI / 4;
      const angle = v.angle();
      if (
        (-range < angle && angle < range) ||
        angle > range * 3 ||
        angle < -range * 3
      ) {
        l[l.length - 1].set(p.x, b.y);
      }
      if (
        (-3 * range < angle && angle < -range) ||
        (range < angle && angle < 3 * range)
      ) {
        l[l.length - 1].set(b.x, p.y);
      }
    });

    this.mouse.on("drag", (e) => {
      /* if (item) {
        const v = this.display.screenToWorld({ x: e.dx!, y: e.dy! }, true);
        item.pos.add(v);
      } else {
        this.display.onDrag(e);
      } */
    });

    this.mouse.on("wheel", (e) => {
      this.display.onZoom(e);
    });
  }

  private adjustToGrid(p: Vector2D) {
    const cellSize = NodeEntity.CELL_SIZE;
    p.y = Math.floor(p.y / cellSize) * cellSize;
    p.x = Math.floor(p.x / cellSize) * cellSize;
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    this.display.drawGrid();
  }
}
