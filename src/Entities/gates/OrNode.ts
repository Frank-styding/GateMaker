import { NodeRecord } from "../../editor/NodeRecord";
import { NodeEntity, type NodeConfig } from "../NodeEntity";

export class OrNode extends NodeEntity {
  protected static LAYERS: HTMLCanvasElement[] = [];
  static CONFIG?: NodeConfig = {
    showLabel: true,
    colSpan: 3,
    rowSpan: 3,
    connectors: [
      { name: "A", direction: "right", idx: 1 },
      { name: "B", direction: "left", idx: 0 },
      { name: "C", direction: "left", idx: 2 },
    ],
    nodeName: "OR",
    showConnectorLabel: true,
  };

  constructor() {
    super();
    this.config = OrNode.CONFIG!;
    this.layer = OrNode.LAYERS[0];
  }
}
OrNode.initLayers();
NodeRecord.registerNode(OrNode);
