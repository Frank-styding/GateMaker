import {
  type Vector2D,
  type HitTestResult,
  HitFlags,
  AssetsManager,
  mouseInsideBox,
  createImageFromCanvas,
} from "../../core";
import { NodeRecord } from "../../editor/NodeRecord";

import {
  ConnectorType,
  NodeEntity,
  NodeType,
  type NodeConfig,
} from "../NodeEntity";

function createActiveButtonLayer(radius: number) {
  return AssetsManager.registerAsset("LED_ACTIVE", {
    width: radius * 2,
    height: radius * 2,
    builder: (ctx) => {
      ctx.beginPath();
      ctx.fillStyle = "#F53C23";
      ctx.arc(radius, radius, radius - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.arc(radius, radius, radius - 2, 0, Math.PI * 2);
      ctx.stroke();
    },
  }) as HTMLCanvasElement;
}

function createDisableButtonLayer(radius: number) {
  return AssetsManager.registerAsset("LED_DISABLE", {
    width: radius * 2,
    height: radius * 2,
    builder: (ctx) => {
      ctx.beginPath();
      ctx.fillStyle = "#F0EFEF";
      ctx.arc(radius, radius, radius - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.arc(radius, radius, radius - 2, 0, Math.PI * 2);
      ctx.stroke();
    },
  }) as HTMLCanvasElement;
}

export class LedNode extends NodeEntity {
  static RADIUS: number = 15;

  activeStateLayer!: HTMLCanvasElement;
  disableStateLayer!: HTMLCanvasElement;

  state: boolean = false;

  protected static LAYERS: HTMLCanvasElement[] = [];

  static CONFIG?: NodeConfig = {
    showLabel: false,
    showConnectorLabel: false,
    colSpan: 1,
    rowSpan: 1,
    connectors: [
      { name: "A", direction: "left", idx: 0, type: ConnectorType.INPUT },
    ],
    nodeName: "LED",
    type: NodeType.OUTPUT,
  };

  static initLayers(): void {
    super.initLayers();
    this.LAYERS.push(createActiveButtonLayer(LedNode.RADIUS));
    this.LAYERS.push(createDisableButtonLayer(LedNode.RADIUS));
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
    this.config = LedNode.CONFIG!;
    this.layer = LedNode.LAYERS[0];
    this.activeStateLayer = LedNode.LAYERS[1];
    this.disableStateLayer = LedNode.LAYERS[2];
  }

  protected init(): void {
    super.init();
  }

  protected drawControls(ctx: CanvasRenderingContext2D): void {
    const layer = this.state ? this.activeStateLayer : this.disableStateLayer;
    const size = LedNode.RADIUS;
    ctx.drawImage(layer, -size, -size, size * 2, size * 2);
  }

  protected onMouseClick(): void {
    this.state = true;
  }

  protected onMouseUp(): void {
    this.state = false;
  }

  public updateState(): void {
    if (!this.wires["A"]) return;
    this.state = this.wires["A"][0].wire.state;
  }
}
LedNode.initLayers();
NodeRecord.registerNode(LedNode);
