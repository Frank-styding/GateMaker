import { NodeEntity } from "../Node";

export class OrEntity extends NodeEntity {
  constructor() {
    super();
    this.showLabel = true;
    this.colSpan = 3;
    this.rowSpan = 3;
    this.connectors = [
      { name: "A", direction: "left", idx: 1 },
      { name: "B", direction: "right", idx: 0 },
      { name: "C", direction: "right", idx: 2 },
    ];
    this.nodeName = "OR";
  }
}
