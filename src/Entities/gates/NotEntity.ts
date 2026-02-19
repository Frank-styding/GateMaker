import { NodeEntity } from "../Node";

export class NotEntity extends NodeEntity {
  constructor() {
    super();
    this.showLabel = true;
    this.colSpan = 3;
    this.rowSpan = 1;
    this.connectors = [
      { name: "A", direction: "left", idx: 0 },
      { name: "B", direction: "right", idx: 0 },
    ];
    this.nodeName = "NOT";
  }
}
