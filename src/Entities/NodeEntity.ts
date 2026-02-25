import {
  AssetsManager,
  BoxCollider,
  createImageFromCanvas,
  Entity,
  Vector2D,
} from "../core";
import { AppEvents } from "../editor/Events";
import { GridManager } from "../editor/GridManager";
import type { Wire } from "./wire/Wire";

export type NodeDirection = "left" | "top" | "right" | "bottom";

export type NodeConnector = {
  name: string;
  direction: NodeDirection;
  idx: number;
};

export interface NodeConfig {
  nodeName: string;
  colSpan: number;
  rowSpan: number;
  showLabel: boolean;
  connectors: NodeConnector[];
  showConnectorLabel: boolean;
}

function createNodeLayer({
  nodeName,
  colSpan,
  rowSpan,
  showLabel,
  showConnectorLabel,
  connectors,
}: NodeConfig) {
  const asset = AssetsManager.get(nodeName);
  if (asset) return asset;

  const cW = NodeEntity.CONNECTION_WIDTH;
  const cH = NodeEntity.CONNECTION_HEIGHT;
  const cellSize = GridManager.CELL_SIZE;
  const width = cellSize * colSpan + cH * 2;
  const height = cellSize * rowSpan + cH * 2;
  return AssetsManager.registerAsset(nodeName, {
    width: width,
    height: height,
    builder: (ctx) => {
      const { width, height } = ctx.canvas;
      const offset = cH;

      ctx.fillStyle = "#ECECEC";
      ctx.fillRect(offset, offset, width - offset * 2, height - offset * 2);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.strokeRect(offset, offset, width - offset * 2, height - offset * 2);

      if (showLabel) {
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(nodeName, width / 2, height / 2);
      }

      ctx.fillStyle = "black";
      ctx.font = "14px Arial";
      ctx.textBaseline = "middle";

      for (let i = 0; i < connectors.length; i++) {
        const connection = connectors[i];
        const pinPos = cH * 2 + connection.idx * cellSize;
        if (connection.direction == "left") {
          ctx.fillRect(0, pinPos, cH, cW);
          if (showConnectorLabel) {
            ctx.textAlign = "left";
            ctx.fillText(connection.name, offset + 4, pinPos + cW / 2 + 2);
          }
        }
        if (connection.direction == "right") {
          ctx.fillRect(width - cH, pinPos, cH, cW);
          if (showConnectorLabel) {
            ctx.textAlign = "right";
            ctx.fillText(
              connection.name,
              width - offset - 4,
              pinPos + cW / 2 + 2,
            );
          }
        }
        if (connection.direction == "top") {
          ctx.fillRect(pinPos, 0, cW, cH);
          if (showConnectorLabel) {
            ctx.textAlign = "center";
            ctx.fillText(connection.name, pinPos + cW / 2, offset + 10);
          }
        }
        if (connection.direction == "bottom") {
          ctx.fillRect(pinPos, height - cH - 1, cW, cH);
          if (showConnectorLabel) {
            ctx.textAlign = "center";
            ctx.fillText(connection.name, pinPos + cW / 2, height - offset - 8);
          }
        }
      }
    },
  }) as HTMLCanvasElement;
}

export class NodeEntity extends Entity {
  // Connector size
  static CONNECTION_WIDTH = GridManager.CELL_SIZE / 2;
  static CONNECTION_HEIGHT = GridManager.CELL_SIZE / 4;
  static PIN_MARGIN = 2;

  protected static LAYERS: HTMLCanvasElement[] = [];
  static CONFIG?: NodeConfig;

  static initLayers(): void {
    this.LAYERS.push(createNodeLayer(this.CONFIG!) as HTMLCanvasElement);
  }

  static getPreview(): HTMLImageElement {
    const preview = this.LAYERS[0];
    return createImageFromCanvas(preview.width, preview.height, (ctx) => {
      ctx.drawImage(preview, 0, 0);
    });
  }

  // Node data
  public width!: number;
  public height!: number;
  public nodeWidth!: number;
  public nodeHeight!: number;

  public layer!: HTMLCanvasElement;

  public config!: NodeConfig;

  //grid properties
  public _cells: number[] = [];

  public _lastCol?: number;
  public _lastRow?: number;

  private wiresPos: Record<string, { wire: Wire; pos: Vector2D }[]> = {};

  constructor() {
    super();
    this.layerIdx = 1;
  }

  protected updateBounding(): void {
    this.bounding.width = this.width;
    this.bounding.height = this.height;
    this.bounding.pos = this.pos;
  }

  protected updateCollider(): void {}

  static adjustPos(node: NodeEntity) {
    const cellSize = GridManager.CELL_SIZE;
    node.pos.x += node.config.colSpan % 2 == 1 ? cellSize / 2 : 0;
    node.pos.y += node.config.rowSpan % 2 == 1 ? cellSize / 2 : 0;
  }

  public initGrid(grid: GridManager) {
    grid.registerEntity(this);
  }

  public deleteWire(startPin: string) {
    delete this.wiresPos[startPin];
  }

  public delete() {
    this.getConnectedWires().forEach((wire) => wire.delete());
    AppEvents.get("grid")?.unregisterEntity(this);
    this.parent?.deleteChild(this);
  }

  protected init(): void {
    const cH = NodeEntity.CONNECTION_HEIGHT;
    const cellSize = GridManager.CELL_SIZE;
    this.pos.x += this.config.colSpan % 2 == 1 ? cellSize / 2 : 0;
    this.pos.y += this.config.rowSpan % 2 == 1 ? cellSize / 2 : 0;
    this.nodeHeight = cellSize * this.config.rowSpan;
    this.nodeWidth = cellSize * this.config.colSpan;
    this.width = this.nodeWidth + cH * 2;
    this.height = this.nodeHeight + cH * 2;
    this.collider = new BoxCollider(this.width, this.height, this.pos);
  }

  public isInside(p: Vector2D) {
    const v = p.clone().subtract(this.pos);
    const v1 = v.abs();
    const cW = NodeEntity.CONNECTION_WIDTH;
    const cH = NodeEntity.CONNECTION_HEIGHT;
    const getIdx = (value: number, maxIdx: number) => {
      let idx = Math.floor(value / cW);
      if (idx % 2 == 0) return undefined;
      idx = (idx - 1) / 2;
      if (idx < 0 || idx >= maxIdx) return undefined;
      return idx;
    };
    let direction: NodeConnector["direction"] = "top";
    let idx: number = -1;
    const horizontal = this.nodeWidth / 2 < v1.x && v1.x < this.width / 2;
    const vertical = this.nodeHeight / 2 < v1.y && v1.y < this.height / 2;
    if (this.nodeWidth / 2 > v1.x && this.nodeHeight / 2 > v1.y) {
      return { type: "box", x: this.pos.x, y: this.pos.y };
    }

    if (!horizontal && !vertical) return undefined;

    if (vertical) {
      const a = getIdx(v.x + this.width / 2, this.config.colSpan);
      if (a == undefined) return;
      if (v.y < 0) direction = "top";
      else direction = "bottom";
      idx = a;
    }

    if (horizontal) {
      const a = getIdx(v.y + this.height / 2, this.config.rowSpan);
      if (a == undefined) return;
      if (v.x < 0) direction = "left";
      else direction = "right";
      idx = a;
    }

    const item = this.config.connectors.filter(
      (item) => item.idx == idx && item.direction == direction,
    )[0];
    if (!item) return undefined;

    const x =
      direction == "top" || direction == "bottom"
        ? this.pos.x - this.width / 2 + (idx * 2 + 1) * cW + cW / 2
        : direction == "left"
          ? this.pos.x - this.width / 2 + cH / 2
          : this.pos.x + this.width / 2 - cH / 2;

    const y =
      direction == "left" || direction == "right"
        ? this.pos.y - this.height / 2 + (idx * 2 + 1) * cW + cW / 2
        : direction == "top"
          ? this.pos.y + this.height / 2 - cH / 2
          : this.pos.y - this.height / 2 + cH / 2;

    return { type: "connector", x, y, name: item.name };
  }

  public getConnectorPos(name: string) {
    const value = this.config.connectors.find((item) => item.name == name);
    if (!value) return undefined;
    const { direction, idx } = value;
    const cW = NodeEntity.CONNECTION_WIDTH;
    const cH = NodeEntity.CONNECTION_HEIGHT;

    const x =
      direction == "top" || direction == "bottom"
        ? this.pos.x - this.width / 2 + (idx * 2 + 1) * cW + cW / 2
        : direction == "left"
          ? this.pos.x - this.width / 2 + cH / 2
          : this.pos.x + this.width / 2 - cH / 2;

    const y =
      direction == "left" || direction == "right"
        ? this.pos.y - this.height / 2 + (idx * 2 + 1) * cW + cW / 2
        : direction == "top"
          ? this.pos.y + this.height / 2 - cH / 2
          : this.pos.y - this.height / 2 + cH / 2;

    return { x, y };
  }

  public setWirePos(name: string, wire: Wire, pos: Vector2D) {
    this.wiresPos[name] ??= [];
    this.wiresPos[name].push({ wire, pos });
  }

  protected onDirty(): void {
    for (const name in this.wiresPos) {
      const pos = this.getConnectorPos(name);
      this.wiresPos[name].forEach((item) => {
        item.pos.set(pos);
        item.wire.markDirty();
      });
    }
  }

  public getConnectedWires() {
    const wires: Wire[] = [];
    for (const item in this.wiresPos) {
      wires.push(...this.wiresPos[item].map((item) => item.wire));
    }
    return wires;
  }

  protected drawControls(_: CanvasRenderingContext2D) {}

  protected render(ctx: CanvasRenderingContext2D): void {
    if (!this.layer) return;
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.drawImage(
      this.layer,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );
    this.drawControls(ctx);
    ctx.restore();
  }
}
