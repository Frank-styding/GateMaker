import { Engine, Entity, Vector2D } from "../core";
import { AndEntity } from "../Entities/gates/AndEntity";
import { NotEntity } from "../Entities/gates/NotEntity";
import { OrEntity } from "../Entities/gates/OrEntity";
import { NodeEntity } from "../Entities/NodeEntity";
import { GridManager } from "./GridManager";
import { initGridPattern } from "./GridPattern";
import { ToolManager } from "./tools/ToolManager";

export class App extends Engine {
  public tools!: ToolManager;
  public grid!: GridManager;

  public init(): void {
    const pattern = initGridPattern(this.display.getContext());
    this.display.setPattern(pattern);
    this.display.setZoomLimits(0.3, 1.7);
    this.grid = new GridManager();
    this.tools = new ToolManager(this.display, this.root, this.grid);
    //? ---------------------------------------
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

  protected onInitEntity(e: Entity): void {
    if (e instanceof NodeEntity) {
      e.initGrid(this.grid);
    }
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    this.display.drawGrid();
  }
  protected renderAfter(ctx: CanvasRenderingContext2D): void {
    this.tools.renderTools(ctx);
  }
}
