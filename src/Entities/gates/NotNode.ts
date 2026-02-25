import { NodeRecord } from "../../editor/NodeRecord";
import { NodeEntity, type NodeConfig } from "../NodeEntity";

export class NotNode extends NodeEntity {
  protected static LAYERS: HTMLCanvasElement[] = [];
  static CONFIG?: NodeConfig = {
    showLabel: true,
    colSpan: 3,
    rowSpan: 1,
    connectors: [
      { name: "A", direction: "left", idx: 0 },
      { name: "B", direction: "right", idx: 0 },
    ],
    nodeName: "NOT",
    showConnectorLabel: true,
  };

  constructor() {
    super();
    this.config = NotNode.CONFIG!;
    this.layer = NotNode.LAYERS[0];
  }
}
NotNode.initLayers();
NodeRecord.registerNode(NotNode);
