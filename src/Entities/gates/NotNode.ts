import { NodeRecord } from "../../editor/NodeRecord";
import {
  ConnectorType,
  NodeEntity,
  NodeType,
  type NodeConfig,
} from "../NodeEntity";

export class NotNode extends NodeEntity {
  protected static LAYERS: HTMLCanvasElement[] = [];
  static CONFIG?: NodeConfig = {
    showLabel: true,
    colSpan: 3,
    rowSpan: 1,
    connectors: [
      { name: "A", direction: "left", idx: 0, type: ConnectorType.INPUT },
      { name: "B", direction: "right", idx: 0, type: ConnectorType.OUTPUT },
    ],
    nodeName: "NOT",
    showConnectorLabel: true,
    type: NodeType.NODE,
  };

  constructor() {
    super();
    this.config = NotNode.CONFIG!;
    this.layer = NotNode.LAYERS[0];
  }

  public updateState(): void {
    if (!this.wires["B"] || !this.wires["A"]) return;
    const a = this.wires["A"][0].wire.state;
    this.wires["B"].forEach((item) => {
      item.wire.state = !a;
    });
  }
}
NotNode.initLayers();
NodeRecord.registerNode(NotNode);
