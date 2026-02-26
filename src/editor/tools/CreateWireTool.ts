import {
  type MouseData,
  type Entity,
  type RenderLayer,
  Vector2D,
  MouseButton,
} from "../../core";
import { ConnectorType, NodeEntity } from "../../Entities/NodeEntity";
import { Wire } from "../../Entities/wire/Wire";
import { AppEvents } from "../Events";
import type { Tool } from "./ToolManager";

export class CreateWireTool implements Tool {
  name = "create_wire";
  lock: boolean = true;
  current: Wire | null = null;
  display!: RenderLayer;
  root!: Entity;

  init(): void {
    this.root = AppEvents.get("root")!;
    this.display = AppEvents.get("display")!;
  }

  validConector(
    node: NodeEntity,
    wire: Wire,
    name: string,
    connectorType: ConnectorType,
  ) {
    const nodeConector = wire.startNode.config.connectors.find(
      ({ name }) => name == wire.startPin,
    );
    return nodeConector?.type != connectorType && node.isValidConnector(name);
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
            if (this.current.startNode.id == node.id) return;
            if (
              !this.validConector(
                node,
                this.current,
                connector.name!,
                connector.connectorType!,
              )
            )
              return;
            this.current.endWire(node, connector.name!, pos);
            this.root.addChild(this.current);
            this.current.forceLayoutUpdate();
            this.current = null;
            AppEvents.emit("unLockTool");
          }
        }
      } else {
        this.current?.addPoint(v);
      }
    } else {
      this.current = null;
      AppEvents.emit("unLockTool");
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
