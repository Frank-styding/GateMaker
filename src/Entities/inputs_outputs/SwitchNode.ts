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

function createActiveSwitchLayer(size: number) {
  return AssetsManager.registerAsset("SWITCH_ACTIVE", {
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
}

function createDisableSwitchLayer(size: number) {
  return AssetsManager.registerAsset("SWITCH_DISABLE", {
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

export class SwitchNode extends NodeEntity {
  static SiZE: number = 26;
  static PREVIEW_NAME: string = "SWITCH_ACTIVE";
  static NODE_NAME: string = "SWITCH";

  activeStateLayer!: HTMLCanvasElement;
  disableStateLayer!: HTMLCanvasElement;

  state: boolean = false;

  protected static LAYERS: HTMLCanvasElement[] = [];

  static CONFIG?: NodeConfig = {
    showLabel: false,
    colSpan: 1,
    rowSpan: 1,
    connectors: [{ name: "A", direction: "right", idx: 0 }],
    nodeName: "SWITCH",
    showConnectorLabel: false,
  };

  static initLayers(): void {
    super.initLayers();
    this.LAYERS.push(createActiveSwitchLayer(SwitchNode.SiZE));
    this.LAYERS.push(createDisableSwitchLayer(SwitchNode.SiZE));
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
    this.config = SwitchNode.CONFIG!;
    this.layer = SwitchNode.LAYERS[0];
    this.activeStateLayer = SwitchNode.LAYERS[1];
    this.disableStateLayer = SwitchNode.LAYERS[2];
  }

  protected init(): void {
    super.init();
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

SwitchNode.initLayers();
NodeRecord.registerNode(SwitchNode);
