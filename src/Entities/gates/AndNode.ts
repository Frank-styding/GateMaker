import { NodeRecord } from "../../editor/NodeRecord";
import {
  ConnectorType,
  NodeEntity,
  NodeType,
  type NodeConfig,
} from "../NodeEntity";

export class AndNode extends NodeEntity {
  protected static LAYERS: HTMLCanvasElement[] = [];
  static CONFIG?: NodeConfig = {
    showLabel: true,
    colSpan: 3,
    rowSpan: 3,
    connectors: [
      { name: "A", direction: "right", idx: 1, type: ConnectorType.OUTPUT },
      { name: "B", direction: "left", idx: 0, type: ConnectorType.INPUT },
      { name: "C", direction: "left", idx: 2, type: ConnectorType.INPUT },
    ],
    nodeName: "AND",
    showConnectorLabel: true,
    type: NodeType.NODE,
  };

  constructor() {
    super();
    this.config = AndNode.CONFIG!;
    this.layer = AndNode.LAYERS[0];
  }

  public updateState(): void {
    if (!this.wires["B"] || !this.wires["C"] || !this.wires["A"]) return;
    const a = this.wires["B"][0].wire.state;
    const b = this.wires["C"][0].wire.state;

    this.wires["A"].forEach((item) => {
      item.wire.state = a && b;
    });
  }
}
AndNode.initLayers();
NodeRecord.registerNode(AndNode);
