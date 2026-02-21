import {
  type MouseData,
  type Entity,
  type RenderLayer,
  Vector2D,
  MouseButton,
} from "../../core";
import { NodeEntity } from "../../Entities/NodeEntity";
import { Wire } from "../../Entities/Wire";
import type { Tool, ToolContext } from "./ToolManager";

export class WireTool implements Tool {
  name = "wire";
  lock: boolean = true;
  current: {
    wire: Wire;
    startNode: NodeEntity;
    startName: string;
  } | null = null;
  display!: RenderLayer;
  root!: Entity;
  unLock!: () => void;

  init(ctx: ToolContext): void {
    this.display = ctx.display;
    this.root = ctx.root;
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
            const wire = new Wire([pos, pos.clone()]);
            this.current = {
              wire,
              startNode: node,
              startName: connector.name!,
            };
          } else {
            const { wire, startNode, startName } = this.current;
            startNode.setWirePos(startName, wire.path[0], wire);
            const lastPos = wire.path[wire.path.length - 1];
            lastPos.set(pos);
            node.setWirePos(connector.name!, lastPos, wire);
            this.root.addChild(wire);
            this.current = null;
            this.unLock();
          }
        }
      } else {
        this.current?.wire.path.push(v);
      }
    } else {
      this.current = null;
      this.unLock();
    }
  }

  onMove(e: MouseData): void {
    const v = this.display.screenToWorldVector(e);
    this.current?.wire.moveLastPoint(v);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.current?.wire._render(ctx);
  }
}
