import { Entity, Vector2D, type MouseData, type RenderLayer } from "../../core";
import {
  MouseButton,
  MouseController,
  MouseEventType,
} from "../../core/MouseController";
import { NodeEntity } from "../../Entities/NodeEntity";
import { CameraTool } from "./CameraTool";
import { WireTool } from "./WireTool";
import { SelectionTool } from "./SelectionTool";
import { Wire } from "../../Entities/Wire";
import type { GridManager } from "../GridManager";
import { ContextMenuTool } from "./ContextMenu";
import { AppEvents } from "../Events";

export interface Tool {
  lock: boolean;
  name: string;
  init?(): void;
  onDown?(e: MouseData, hits?: Entity): void;
  onDrag?(e: MouseData): void;
  onUp?(e: MouseData): void;
  onMove?(e: MouseData): void;
  onWheel?(e: MouseData): void;
  render?(ctx: CanvasRenderingContext2D): void;
  reset?(): void;
}

export class ToolManager {
  mouse: MouseController;
  tools = new Map<string, Tool>();
  current: Tool | null = null;
  prev: Tool | null = null;

  private hits: Entity[] = [];
  public display!: RenderLayer;
  public root!: Entity;
  public grid!: GridManager;

  constructor() {
    this.display = AppEvents.get("display")!;
    this.root = AppEvents.get("root")!;
    this.grid = AppEvents.get("grid")!;

    AppEvents.send("tools", () => this);
    AppEvents.on("unLockTool", () => this.restore());

    this.mouse = new MouseController(this.display.getCanvas());
    this.initTools();
    this.initEvents();
  }

  initTools() {
    this.register(new CameraTool());
    this.register(new WireTool());
    this.register(new SelectionTool());
    this.register(new ContextMenuTool());
  }

  register(tool: Tool) {
    tool.init?.();
    this.tools.set(tool.name, tool);
  }

  use(name: string) {
    this.current?.reset?.();
    this.prev = this.current;
    this.current = this.tools.get(name) ?? null;
  }

  restore() {
    this.prev = this.current;
    this.current = null;
  }

  autoSelectTool(hit: Entity | undefined, e: MouseData) {
    if (this.current?.lock) return;
    if (e.button == MouseButton.MIDDLE) return;

    if (hit) {
      if (hit instanceof NodeEntity) {
        const hitNode = hit.isInside(new Vector2D(e));
        if (hitNode?.type == "box") {
          this.use("selection");
          return;
        }
        if (hitNode?.type == "connector") {
          this.use("wire");
        }
      }
      if (hit instanceof Wire) {
        this.use("selection");
      }
    } else {
      if (e.button == MouseButton.LEFT) {
        this.use("selection");
      } else {
        this.restore();
      }
    }
  }

  // -------- Selection ----------
  getHits(pos: Vector2D): Entity | undefined {
    this.hits.length = 0;
    const item = this.grid.queryPoint(pos.x, pos.y);
    if (item.length > 0) {
      return item[0];
    }
    Entity.collect(this.root, this.hits, (ent) =>
      ent.getAABB().mouseIsInside(pos),
    );
    this.hits.sort((a, b) => b.layerIdx - a.layerIdx);
    return this.hits.find((e) => e.getCollider()?.mouseIsInside(pos));
  }

  // -------- Events ----------
  private initEvents() {
    this.mouse.on(MouseEventType.DOWN_ONCE, (e) => {
      const we = this.display.screenToWorld(e);
      const hit = this.getHits(new Vector2D(we));
      this.autoSelectTool(hit, we);
      this.current?.onDown?.(e, hit);
      this.tools.get("context_menu")?.onDown?.(e);
    });
    this.mouse.on(MouseEventType.DRAG, (e) => {
      this.tools.get("camera")?.onDrag?.(e);
      this.current?.onDrag?.(e);
    });
    this.mouse.on(MouseEventType.MOVE, (e) => this.current?.onMove?.(e));
    this.mouse.on(MouseEventType.UP_ONCE, (e) => this.current?.onUp?.(e));
    this.mouse.on(MouseEventType.WHEEL, (e) => {
      this.tools.get("camera")?.onWheel?.(e);
      if (this.current?.lock) return;
      this.current?.onWheel?.(e);
    });
  }

  renderTools(ctx: CanvasRenderingContext2D) {
    this.current?.render?.(ctx);
  }
}
