import { NodeRecord } from "../../editor/NodeRecord";
import { NodeEntity, type NodeConfig } from "../NodeEntity";

export class AndNode extends NodeEntity {
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
    nodeName: "AND",
    showConnectorLabel: true,
  };

  constructor() {
    super();
    this.config = AndNode.CONFIG!;
    this.layer = AndNode.LAYERS[0];
  }
}
AndNode.initLayers();
NodeRecord.registerNode(AndNode);
