import {
  type Vector2D,
  type HitTestResult,
  HitFlags,
  AssetsManager,
  mouseInsideBox,
} from "../../core";

import { NodeEntity } from "../NodeEntity";

export class SwitchNode extends NodeEntity {
  static SiZE: number = 26;

  activeStateLayer!: HTMLCanvasElement;
  disableStateLayer!: HTMLCanvasElement;

  state: boolean = false;

  constructor() {
    super();
    this.showLabel = false;
    this.showConnectorLabel = false;
    this.colSpan = 1;
    this.rowSpan = 1;
    this.connectors = [{ name: "A", direction: "right", idx: 0 }];
    this.nodeName = "Button";
  }

  protected init(): void {
    super.init();
    const size = SwitchNode.SiZE;
    this.activeStateLayer = AssetsManager.registerAsset("SWITCH_ACTIVE", {
      width: size,
      height: size,
      builder: (ctx) => {
        ctx.fillStyle = "#F53C23";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#303030";
        ctx.fillRect(size - 10, 0, 10, size);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);
      },
    }) as HTMLCanvasElement;
    this.disableStateLayer = AssetsManager.registerAsset("SWITCH_DISABLE", {
      width: size,
      height: size,
      builder: (ctx) => {
        ctx.fillStyle = "#F0EFEF";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#303030";
        ctx.fillRect(0, 0, 10, size);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, size, size);
      },
    }) as HTMLCanvasElement;
  }

  protected drawControls(ctx: CanvasRenderingContext2D): void {
    const layer = this.state ? this.activeStateLayer : this.disableStateLayer;
    const size = SwitchNode.SiZE;
    ctx.drawImage(layer, -size / 2, -size / 2, size, size);
  }

  public hitTest(pos: Vector2D): HitTestResult | null {
    const size = SwitchNode.SiZE;

    const result = super.hitTest(pos);
    if (mouseInsideBox(this.pos, pos, size / 2, size / 2)) {
      return { entity: this, areaFlags: HitFlags.CLICK | HitFlags.UP };
    }
    return result;
  }

  protected onMouseClick(): void {
    this.state = !this.state;
  }

  protected onMouseUp(): void {}
}
