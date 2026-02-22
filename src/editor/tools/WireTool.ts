import {
  type MouseData,
  type Entity,
  type RenderLayer,
  Vector2D,
  MouseButton,
} from "../../core";
import { NodeEntity } from "../../Entities/NodeEntity";
import { Wire } from "../../Entities/Wire";
import type { GridManager } from "../GridManager";
import type { Tool, ToolContext } from "./ToolManager";

export class WireTool implements Tool {
  name = "wire";
  lock: boolean = true;
  current: Wire | null = null;
  display!: RenderLayer;
  root!: Entity;
  grid!: GridManager;
  unLock!: () => void;

  init(ctx: ToolContext): void {
    this.display = ctx.display;
    this.root = ctx.root;
    this.grid = ctx.grid;
    this.unLock = ctx.unLock;
  }

  onDown(e: MouseData, hits?: Entity): void {
    const v = this.display.screenToWorldVector(e);
    if (e.button == MouseButton.LEFT) {
      const node = hits as NodeEntity;
      if (node instanceof NodeEntity) {
        const connector = node.isInside(v);
        const pos = new Vector2D(connector);
        if (connector && connector.type == "connector") {
          if (!this.current) {
            const wire = new Wire();
            wire.startWire(node, connector.name!, pos);
            this.current = wire;
          } else {
            this.current.endWire(node, connector.name!, pos);
            this.root.addChild(this.current);
            this.current.recalc(this.grid);
            this.current.forceLayoutUpdate();
            this.current = null;
            this.unLock();
          }
        }
      }
    } else {
      this.current = null;
      this.unLock();
    }
  }

  onMove(e: MouseData): void {
    const v = this.display.screenToWorldVector(e);
    this.current?.moveLastPoint(v);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.current?._render(ctx);
  }
}
