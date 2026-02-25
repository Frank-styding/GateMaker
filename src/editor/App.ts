import { Engine, Entity, Vector2D } from "../core";
import { AndNode } from "../Entities/gates/AndNode";
import { NotNode } from "../Entities/gates/NotNode";
import { OrNode } from "../Entities/gates/OrNode";
import { ButtonNode } from "../Entities/inputs_outputs/ButtonNode";
import { SwitchNode } from "../Entities/inputs_outputs/SwitchNode";
import { NodeEntity } from "../Entities/NodeEntity";
import { ContextMenu } from "./ContextMenu";
import { AppEvents } from "./Events";
import { GridManager } from "./GridManager";
import { initGridPattern } from "./GridPattern";
import { NodeCatalog } from "./NodeCatalog";
import { ToolManager } from "./tools/ToolManager";

export class App extends Engine {
  public tools!: ToolManager;
  public grid!: GridManager;
  public contextMenu!: ContextMenu;
  public nodeCatalog!: NodeCatalog;

  constructor() {
    super();
    this.contextMenu = new ContextMenu();
    this.nodeCatalog = new NodeCatalog();

    AppEvents.send("display", () => this.display);
    AppEvents.send("grid", () => this.grid);
    AppEvents.send("root", () => this.root);
    AppEvents.on("on_context_calc_wire", ({ wires }) => {
      wires.forEach((wire) => {
        wire.recalc();
        wire.forceLayoutUpdate();
      });
    });

    AppEvents.on("on_context_delete", ({ wires, nodes }) => {
      nodes.forEach((node) => node.delete());
      wires.forEach((wire) => wire.delete());
      AppEvents.emit("resetTool");
      AppEvents.emit("unLockTool");
    });

    AppEvents.on("on_context_add_node", ({ x, y }) => {
      AppEvents.emit("openNodeCatalog", { x, y });
    });
    AppEvents.on("addEntity", ({ node }) => {
      this.root.addChild(node);
    });
  }

  public init(): void {
    const pattern = initGridPattern(this.display.getContext());
    this.display.setPattern(pattern);
    this.display.setZoomLimits(0.3, 1.7);
    this.grid = new GridManager();
    this.tools = new ToolManager();
    //? ---------------------------------------
    this.display.panX = this.display.width / 2 - 200;
    this.display.panY = this.display.height / 2;
    this.display.zoom = 1;
    this.initComponents();
    AppEvents.emit("loadNodes");
  }

  private initComponents() {
    const a = new AndNode();
    const b = new AndNode();
    const c = new AndNode();
    const d = new NotNode();
    const e = new OrNode();
    const f = new ButtonNode();
    const g = new SwitchNode();

    a.pos.add(new Vector2D(300, 50));
    b.pos.add(new Vector2D(300, -150));
    c.pos.add(new Vector2D(0, -200));
    d.pos.add(new Vector2D(0, 150));
    f.pos.add(new Vector2D(400, 400));
    g.pos.add(new Vector2D(450, 0));

    this.root.addChild(a);
    this.root.addChild(b);
    this.root.addChild(c);
    this.root.addChild(d);
    this.root.addChild(e);
    this.root.addChild(f);
    this.root.addChild(g);
  }

  protected onInitEntity(e: Entity): void {
    if (e instanceof NodeEntity) {
      e.initGrid(this.grid);
    }
  }

  public getContextMenu() {
    return this.contextMenu.getElement();
  }

  public getNodeCalalog() {
    return this.nodeCatalog.getElement();
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    this.display.drawGrid();
  }
  protected renderAfter(ctx: CanvasRenderingContext2D): void {
    this.tools.renderTools(ctx);
  }
}
