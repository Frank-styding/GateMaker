import {
  type Vector2D,
  type HitTestResult,
  HitFlags,
  mouseInsideBox,
  mouseIsInsideCircle,
  AssetsManager,
} from "../../core";

import { NodeEntity } from "../NodeEntity";

export class ButtonNode extends NodeEntity {
  static BUTTON_RADIUS: number = 13;

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
    const r = ButtonNode.BUTTON_RADIUS;
    this.activeStateLayer = AssetsManager.registerAsset("BUTTON_ACTIVE", {
      width: r * 2,
      height: r * 2,
      builder: (ctx) => {
        ctx.beginPath();
        ctx.fillStyle = "#F53C23";
        ctx.arc(r, r, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.arc(r, r, r - 1, 0, Math.PI * 2);
        ctx.stroke();
      },
    }) as HTMLCanvasElement;
    this.disableStateLayer = AssetsManager.registerAsset("BUTTON_DISABLE", {
      width: r * 2,
      height: r * 2,
      builder: (ctx) => {
        ctx.beginPath();
        ctx.fillStyle = "#F0EFEF";
        ctx.arc(r, r, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.arc(r, r, r - 1, 0, Math.PI * 2);
        ctx.stroke();
      },
    }) as HTMLCanvasElement;
  }

  protected drawControls(ctx: CanvasRenderingContext2D): void {
    const layer = this.state ? this.activeStateLayer : this.disableStateLayer;
    const r = ButtonNode.BUTTON_RADIUS;
    ctx.drawImage(layer, -r, -r, r * 2, r * 2);
  }

  public hitTest(pos: Vector2D): HitTestResult | null {
    const r = ButtonNode.BUTTON_RADIUS;

    const result = super.hitTest(pos);
    if (mouseIsInsideCircle(this.pos, pos, r)) {
      return { entity: this, areaFlags: HitFlags.CLICK | HitFlags.UP };
    }
    return result;
  }

  protected onMouseClick(pos: Vector2D): void {
    this.state = true;
  }

  protected onMouseUp(pos: Vector2D): void {
    this.state = false;
  }
}
