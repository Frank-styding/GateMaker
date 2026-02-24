import { NodeEntity } from "../NodeEntity";

export class Button extends NodeEntity {
  constructor() {
    super();
    this.showLabel = false;
    this.showConnectorLabel = false;
    this.colSpan = 1;
    this.colSpan = 1;
    this.connectors = [{ name: "A", direction: "right", idx: 0 }];
  }
}
