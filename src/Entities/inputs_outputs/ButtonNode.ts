import {
  type Vector2D,
  type HitTestResult,
  HitFlags,
  AssetsManager,
  mouseInsideBox,
  createImageFromCanvas,
} from "../../core";
import { NodeRecord } from "../../editor/NodeRecord";

import { NodeEntity, type NodeConfig } from "../NodeEntity";

function createActiveButtonLayer(size: number) {
  return AssetsManager.registerAsset("BUTTON_ACTIVE", {
    width: size,
    height: size,
    builder: (ctx) => {
      ctx.fillStyle = "#F53C23";
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, size, size);
    },
  }) as HTMLCanvasElement;
}

function createDisableButtonLayer(size: number) {
  return AssetsManager.registerAsset("BUTTON_DISABLE", {
    width: size,
    height: size,
    builder: (ctx) => {
      ctx.fillStyle = "#F0EFEF";
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, size, size);
    },
  }) as HTMLCanvasElement;
}

export class ButtonNode extends NodeEntity {
  static SIZE: number = 26;

  activeStateLayer!: HTMLCanvasElement;
  disableStateLayer!: HTMLCanvasElement;

  state: boolean = false;

  protected static LAYERS: HTMLCanvasElement[] = [];

  static CONFIG?: NodeConfig = {
    showLabel: false,
    showConnectorLabel: false,
    colSpan: 1,
    rowSpan: 1,
    connectors: [{ name: "A", direction: "right", idx: 0 }],
    nodeName: "BUTTON",
  };

  static initLayers(): void {
    super.initLayers();
    this.LAYERS.push(createActiveButtonLayer(ButtonNode.SIZE));
    this.LAYERS.push(createDisableButtonLayer(ButtonNode.SIZE));
  }

  static getPreview(): HTMLImageElement {
    const preview = this.LAYERS[0];
    const control = this.LAYERS[1];
    return createImageFromCanvas(preview.width, preview.height, (ctx) => {
      ctx.drawImage(preview, 0, 0);
      ctx.drawImage(
        control,
        preview.width / 2 - control.width / 2,
        preview.height / 2 - control.height / 2,
      );
    });
  }

  constructor() {
    super();
    this.config = ButtonNode.CONFIG!;
    this.layer = ButtonNode.LAYERS[0];
    this.activeStateLayer = ButtonNode.LAYERS[1];
    this.disableStateLayer = ButtonNode.LAYERS[2];
  }

  protected init(): void {
    super.init();
  }

  protected drawControls(ctx: CanvasRenderingContext2D): void {
    const layer = this.state ? this.activeStateLayer : this.disableStateLayer;
    const size = ButtonNode.SIZE;
    ctx.drawImage(layer, -size / 2, -size / 2, size, size);
  }

  public hitTest(pos: Vector2D): HitTestResult | null {
    const size = ButtonNode.SIZE;

    const result = super.hitTest(pos);
    if (mouseInsideBox(this.pos, pos, size / 2, size / 2)) {
      return { entity: this, areaFlags: HitFlags.CLICK | HitFlags.UP };
    }
    return result;
  }

  protected onMouseClick(): void {
    this.state = true;
  }

  protected onMouseUp(): void {
    this.state = false;
  }
}
ButtonNode.initLayers();
NodeRecord.registerNode(ButtonNode);
