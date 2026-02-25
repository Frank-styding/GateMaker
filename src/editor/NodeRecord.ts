import type { NodeEntity } from "../Entities/NodeEntity";

export class NodeRecord {
  private constructor() {}
  static record: Record<
    string,
    { node: typeof NodeEntity; img?: HTMLImageElement }
  > = {};

  static registerNode(node: typeof NodeEntity) {
    const name = node.CONFIG!.nodeName;
    const preview = node.getPreview();
    this.record[name] = { node, img: preview };
  }

  static getNodes() {
    return Object.keys(this.record).map((key) => this.record[key]);
  }
}
