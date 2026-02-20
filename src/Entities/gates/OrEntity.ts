import { NodeEntity } from "../NodeEntity";

export class OrEntity extends NodeEntity {
  constructor() {
    super();
    this.showLabel = true;
    this.colSpan = 3;
    this.rowSpan = 3;
    this.connectors = [
      { name: "A", direction: "right", idx: 1 },
      { name: "B", direction: "left", idx: 0 },
      { name: "C", direction: "left", idx: 2 },
    ];
    this.nodeName = "OR";
  }
}
